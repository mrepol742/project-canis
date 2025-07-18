import log from "../components/log";
import { Client, LocalAuth, Message } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import rateLimiter from "./rateLimiter";
import { commands } from "../index";
import { isRateLimitError, getRateLimitInfo } from "./rateLimit";

const commandPrefix = process.env.COMMAND_PREFIX || "!";
const commandPrefixLess = process.env.COMMAND_PREFIX_LESS === "true";
const debug = process.env.DEBUG === "true";
const superAdmin = process.env.SUPER_ADMIN || "";

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  log.info("QR Code", "Scan this QR code with your WhatsApp app:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  log.info("Client", "WhatsApp client is ready!");
});

// client.on("message", (msg) => messageEvent(msg));
client.on("message_create", (msg) => messageEvent(msg));

client.on("auth_failure", (msg) => {
  log.error("Auth", "Authentication failed. Please try again.");
});

client.initialize();

const messageEvent = async (msg: Message) => {
  // ignore message if it is older than 10 seconds
  if (msg.timestamp < Date.now() / 1000 - 10) return;

  // process normalization
  msg.body = msg.body
    .normalize("NFKC")
    .replace(/[\u0300-\u036f\u00b4\u0060\u005e\u007e]/g, "");

  const prefix = !msg.body.startsWith(commandPrefix);
  const senderId = msg.from.split("@")[0];

  /*
   * Prefix
   */
  if (!commandPrefixLess && prefix) return;
  if (msg.fromMe && prefix) return;

  /*
   * Check if the message starts with the command prefix.
   */
  const messageBody = msg.body.split(" ")[0];
  const bodyHasPrefix = messageBody.startsWith(commandPrefix);
  const key = bodyHasPrefix
    ? messageBody.slice(commandPrefix.length)
    : messageBody;
  const handler = commands[key.toLocaleLowerCase()];
  if (!handler) return;

  /*
   * Rate limit commands to prevent abuse.
   */
  if (senderId !== superAdmin) {
    const rate = rateLimiter(msg.from);
    if (rate === null) return;
    if (!rate) {
      msg.reply("You are sending commands too fast. Please wait a minute.");
      return;
    }
  }

  /*
   * Role base restrictions.
   */
  if (handler.role === "admin" && !msg.fromMe && senderId !== superAdmin) {
    return;
  }

  if (debug) log.info("Message", msg.body.slice(0, 255));
  msg.body = !bodyHasPrefix ? msg.body : msg.body.slice(commandPrefix.length);

  /*
   * Execute the command handler.
   */
  try {
    await handler.exec(msg);
  } catch (error) {
    if (isRateLimitError(error)) {
      const rateLimitInfo = getRateLimitInfo(error);
      log.warn(key, "Rate limit exceeded", rateLimitInfo);
    } else {
      log.error(key, "Error occured while processing the request.");
    }
    msg.reply("An error occurred while processing your request.");
  }
};

export { client };

import fs from "fs";
import path from "path";
import { fileExists } from "../file";
import { MessageMedia } from "whatsapp-web.js";
import { getClient } from "../../client";
import axios from "../../axios";
import log from "../log";
import { Message } from "../../../types/message";

export default async function (msg: Message, jid: string): Promise<MessageMedia | undefined> {
  try {
    const tempDir = "./.temp";
    await fs.promises.mkdir(tempDir, { recursive: true });
    const savePath = path.join(tempDir, `profile_${jid.split("@")[0]}.png`);

    if (await fileExists(savePath)) {
      return MessageMedia.fromFilePath(savePath);
    }

    const avatarUrl = await getClient(msg.clientId).getProfilePicUrl(jid);

    if (!avatarUrl) return undefined;

    const res = await axios.get(avatarUrl, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(res.data, "binary");

    await fs.promises.writeFile(savePath, buffer);
    return new MessageMedia(
      "image/jpeg",
      buffer.toString("base64"),
      "avatar.jpg",
    );
  } catch (error) {
    log.error("Me", "Unable to fetch user profile pic:", error);
    return undefined;
  }
}

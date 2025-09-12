import { Message } from "../../types/message";
import log from "../components/utils/log";

export const info = {
  command: "license",
  description: "Display the License of the bot.",
  usage: "license",
  example: "license",
  role: "legal",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^license/i.test(msg.body)) return;

  const text = `
  \`License\`
    MIT License with Commons Clause and Commercial Licensing

    Copyright (c) 2025 Melvin Jones Repol

    Permission is hereby granted, free of charge, to use, copy, modify, and distribute the software under the MIT License, with the following additional condition:

    1. **Commercial Use Restriction**: You may not use the software for commercial purposes unless you obtain a commercial license. Commercial use includes, but is not limited to, the use of the software as part of any service offered for a fee, or any use that generates revenue either directly or indirectly.

    2. **Commercial Licensing**: To use this software for commercial purposes, you must obtain a commercial license by paying the required fee. For licensing inquiries, pricing, and terms, please contact mrepol742@gmail.com.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    `;

  await msg.reply(text);
}

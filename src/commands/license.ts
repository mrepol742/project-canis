import { Message } from "../types/message"
import log from "../components/utils/log";

export const info = {
  command: "license",
  description: "Display the License of the bot.",
  usage: "license",
  example: "license",
  role: "legal",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (!/^license/i.test(msg.body)) return;

  const text = `
    \`License\`
    Copyright 2025 Melvin Jones Repol

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    `;

  await msg.reply(text);
}

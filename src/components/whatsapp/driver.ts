import { Call, GroupNotification, Reaction, WAState } from "whatsapp-web.js";
import { Message } from "../../types/message";

export default class WhatsAppDriver {
  async loading_screen(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async authenticated(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async qrCode(qr: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async ready(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async message(msg: Message): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async message_update(msg: Message): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async message_revoke(msg: Message, revoked_msg: any): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async message_reaction(msg: Reaction): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async call(call: Call): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async group_join(notif: GroupNotification): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async group_leave(notif: GroupNotification): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async group_admin_changed(notif: GroupNotification): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async auth_failure(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async disconnected(reason: WAState | "LOGOUT"): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

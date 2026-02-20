import "whatsapp-web.js";

declare module "whatsapp-web.js" {
  interface Client {
    clientId: string;
    isRoot: boolean;
  }
  interface Call {
    clientId: string;
  }
  interface Message {
    clientId: string;
  }
  interface GroupNotification {
    clientId: string;
  }
  interface Reaction {
    clientId: string;
  }
}

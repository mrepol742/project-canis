type MessageFn = (user: string) => string;

interface MessageSets {
  welcome: MessageFn[];
  leaving: MessageFn[];
}

const messages: MessageSets = {
  welcome: [
    (user) => `Welcome ${user}! 🎉`,
    (user) => `Hello ${user}, glad you joined us 👋`,
    (user) => `Hey ${user}, welcome aboard 🚀`,
    (user) => `Nice to see you, ${user}! 🌟`,
    (user) => `A warm welcome to you, ${user}! 🫶`,
    (user) => `${user} just arrived! Everyone say hi 👋`,
    (user) => `Happy to have you here, ${user}! 🌈`,
    (user) => `${user}, you’ve entered the chat. Let’s go! 🔥`,
    (user) => `Cheers to ${user} for joining us 🥂`,
    (user) => `Big welcome to ${user}! 💫`,
    (user) => `${user} has landed 🛬`,
    (user) => `Good to see you, ${user}. Make yourself at home 🏡`,
  ],
  leaving: [
    (user) => `Goodbye ${user}, we’ll miss you 😢`,
    (user) => `See you later ${user}, take care 👋`,
    (user) => `Sad to see you go, ${user} 💔`,
    (user) => `Farewell ${user}, until next time 🌈`,
    (user) => `Bye ${user}, wishing you all the best 🍀`,
    (user) => `${user} has left the building 🏃‍♂️💨`,
    (user) => `Take care ${user}, hope to see you again 🙏`,
    (user) => `Adios ${user}! Safe travels 🌍`,
    (user) => `${user} has signed off. Catch you later 💻`,
    (user) => `We’ll keep your seat warm, ${user} 🔥`,
    (user) => `Goodbye ${user}, it won’t be the same without you 🥺`,
    (user) => `${user} just disappeared like a ninja 🥷✨`,
  ]
};

export function getMessage(type: keyof MessageSets, user: string): string {
  const arr = messages[type];
  return arr[Math.floor(Math.random() * arr.length)](user);
}

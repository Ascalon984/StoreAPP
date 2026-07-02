import { Message } from "./types";

export function getGreetingMessage(
  source: "profile" | "product" | "order",
  userName?: string,
  productSnippet?: Message["productSnippet"],
  orderSnippet?: Message["orderSnippet"],
): Message[] {
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 11
      ? "Selamat pagi"
      : hour < 15
        ? "Selamat siang"
        : hour < 18
          ? "Selamat sore"
          : "Selamat malam";
  const name = userName ? `${timeGreeting}, ${userName}!` : `${timeGreeting}!`;

  if (source === "product" && productSnippet) {
    return [
      {
        id: "greeting-1",
        role: "agent",
        type: "text",
        text: `Halo ${name}, ada yang ingin ditanyakan mengenai ${productSnippet.name}? Kami siap membantu 😊`,
        timestamp: new Date(),
      },
      {
        id: "greeting-2",
        role: "user",
        type: "product",
        productSnippet,
        timestamp: new Date(),
      },
    ];
  }

  if (source === "order" && orderSnippet) {
    return [
      {
        id: "greeting-1",
        role: "agent",
        type: "text",
        text: `Halo! Kami siap membantu terkait pesananmu 😊`,
        timestamp: new Date(),
      },
      {
        id: "greeting-2",
        role: "user",
        type: "order",
        orderSnippet,
        timestamp: new Date(),
      },
    ];
  }

  return [
    {
      id: "greeting-1",
      role: "agent",
      type: "text",
      text: `Halo, ${userName || "Kak"}! 👋\nAda yang bisa kami bantu hari ini?`,
      timestamp: new Date(),
    },
  ];
}

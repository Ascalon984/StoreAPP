export function normalizeEmailLight(value: string): string {
  return value.replace(/\s+/g, "").replace(/,+/g, ".").replace(/@@+/g, "@");
}

export function normalizeEmailOnBlur(value: string): string {
  let val = value.trim().replace(/\s+/g, "");

  const commonDomains = [
    "gmail.com",
    "yahoo.com",
    "yahoo.co.id",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
  ];

  // user@gmail.com -> user@gmail.com
  // user.gmail.com -> user@gmail.com
  if (!val.includes("@")) {
    for (const domain of commonDomains) {
      if (val.toLowerCase().endsWith(`.${domain}`)) {
        val = val.substring(0, val.length - domain.length - 1) + "@" + domain;
        break;
      }
    }

    const partialDomains: Record<string, string> = {
      ".gmail": "@gmail",
      ".yahoo": "@yahoo",
      ".hotmail": "@hotmail",
      ".outlook": "@outlook",
      ".icloud": "@icloud",
    };

    for (const [from, to] of Object.entries(partialDomains)) {
      if (val.toLowerCase().endsWith(from)) {
        val = val.substring(0, val.length - from.length) + to;
        break;
      }
    }
  }

  // rapikan @@
  val = val.replace(/@@+/g, "@");

  const atIndex = val.lastIndexOf("@");
  if (atIndex === -1) return val;

  const local = val.substring(0, atIndex);
  let domain = val.substring(atIndex + 1).toLowerCase();

  // ----------------------------
  // Normalisasi umum
  // ----------------------------
  domain = domain
    .replace(/,+/g, ".")
    .replace(/\.\.+/g, ".")
    .replace(/\.c0m$/, ".com")
    .replace(/\.coom$/, ".com")
    .replace(/\.comm$/, ".com")
    .replace(/\.con$/, ".com")
    .replace(/\.cm$/, ".com")
    .replace(/\.cpm$/, ".com")
    .replace(/\.xom$/, ".com")
    .replace(/\.vom$/, ".com")
    .replace(/\.dom$/, ".com")
    .replace(/com$/, "com");

  // ----------------------------
  // Typo provider
  // ----------------------------
  const providerMap: Record<string, string> = {
    "gmial.com": "gmail.com",
    "gmaill.com": "gmail.com",
    "gmai.com": "gmail.com",
    "gnail.com": "gmail.com",
    gmailcom: "gmail.com",

    "yaho.com": "yahoo.com",
    "yhoo.com": "yahoo.com",
    yahoocom: "yahoo.com",

    "hotmial.com": "hotmail.com",
    "hotmai.com": "hotmail.com",
    hotmailcom: "hotmail.com",

    "outlok.com": "outlook.com",
    "outllook.com": "outlook.com",
    outlookcom: "outlook.com",

    "icluod.com": "icloud.com",
    "iclod.com": "icloud.com",
    icloudcom: "icloud.com",

    "yahoo.co.od": "yahoo.co.id",
    "yahoo.coi.id": "yahoo.co.id",
  };

  if (providerMap[domain]) {
    domain = providerMap[domain];
  }

  return `${local}@${domain}`;
}

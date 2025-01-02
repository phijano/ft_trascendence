import { getTranslation } from "../../../../../../utils";

export function Menu() {
  const menu = document.createElement("nav");

  // Fetch the language setting from the backend
  fetch("/get_language/")
    .then((response) => response.json())
    .then((data) => {
      const lang = data.language_code;

      const homeText = getTranslation("home", lang);
      const playText = getTranslation("play", lang);

      menu.id = "nMenu";
      menu.innerHTML = `
        <a class="px-3 text-decoration-none orbitron-font orbitron-font-large" href="/">${homeText}</a>
        <a class="px-3 text-decoration-none orbitron-font orbitron-font-large" href="/pong">${playText}</a>
      `;
    });

  return menu;
}

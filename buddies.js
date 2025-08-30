export const buddies = [
  { name: 'CosmoCat', folder: 'animals', icon: "assets/characters/animals/CatIcon.png", img: "assets/characters/animals/Cat.gif" },
  { name: "Bernie", folder: "animals", icon: "assets/characters/animals/BernieIcon.png", img: "assets/characters/animals/Bernie.gif" },
  { name: 'Mr.Ribbit', folder: 'animals', icon: "assets/characters/animals/Mr.RibbitIcon.png", img: "assets/characters/animals/Mr. Ribbit.gif"},
  { name: 'Chip', folder: 'animals', icon: "assets/characters/animals/ChipIcon.png", img: "assets/characters/animals/Chip.gif"}
];

export function renderBuddyButton(buddy) {
  const button = document.createElement("div");
  button.className = "buddy-btn";

  const iconWrapper = document.createElement("div");
  iconWrapper.className = "buddy-img-wrapper";

  const icon = document.createElement("img");
  icon.src = chrome.runtime.getURL(buddy.icon);
  icon.alt = buddy.name;
  icon.className = "buddy-img";
  iconWrapper.appendChild(icon);
  iconWrapper.style.alignContent = "center"

  const label = document.createElement("span");
  label.className = "pixelFont-small";
  label.style.fontSize = "9px";
  label.style.transformOrigin = "center"
  label.textContent = buddy.name;

  button.appendChild(iconWrapper);
  button.appendChild(label);

  return button;
}

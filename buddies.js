// buddies.js

export const buddies = [
  { name: 'CosmoCat', folder: 'Animals', icon: "assets/characters/Animals/CatIcon.png", img: "assets/characters/Animals/Cat.gif" },
  { name: "Bernie", folder: "Animals", icon: "assets/characters/Animals/BernieIcon.png", img: "assets/characters/Animals/Bernie.gif" },
  { name: 'Mr.Ribbit', folder: 'Animals', icon: "assets/characters/Animals/Mr.RibbitIcon.png", img: "assets/characters/Animals/Mr. Ribbit.gif"},
  { name: 'Chip', folder: 'Animals', icon: "assets/characters/Animals/ChipIconReal.png", img: "assets/characters/Animals/Chip.gif"}
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

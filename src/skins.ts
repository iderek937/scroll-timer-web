export type Skin = {
	id: string;
	name: string;
	scrollerBackground: string;
	scrollerDigits: string;
	timerBackground: string;
	timerDigits: string;
	scrollerShadow: string;
	timerShadow: string;
	settingsIcon: string;
};

export const SKINS: Skin[] = [
	{
		id: "ink",
		name: "Ink",
		scrollerBackground: "#ffffff",
		scrollerDigits: "#fefefe",
		timerBackground: "#ffffff",
		timerDigits: "#00030c",
		scrollerShadow: "#94a3b8",
    timerShadow: "#64748b",
		settingsIcon: "#000000"
	},
	{
		id: "paper",
		name: "Paper",
		scrollerBackground: "#171717",
		scrollerDigits: "#444444",
		timerBackground: "#171717",
		timerDigits: "#f8fafc",
		scrollerShadow: "#64748b",
		timerShadow: "#000000",
		settingsIcon: "#ffffff"
	},
	{
		id: "amber",
		name: "Amber",
		scrollerBackground: "#ffac00",
		scrollerDigits: "#ec8e00",
		timerBackground: "#ffac00",
		timerDigits: "#200f00",
		scrollerShadow: "#7c2d12",
		timerShadow: "#7c2d12",
		settingsIcon: "#000000"
	},
];

export const DEFAULT_SKIN = SKINS[1];

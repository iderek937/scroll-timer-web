export type Skin = {
	id: string;
	name: string;
	scrollerBackground: string;
	scrollerDigits: string;
	timerBackground: string;
	timerDigits: string;
	scrollerShadow: string;
	timerShadow: string;
};

export const SKINS: Skin[] = [
	{
		id: "ink",
		name: "Ink",
		scrollerBackground: "#ffffff",
		scrollerDigits: "#0b0b0d",
		timerBackground: "#0b0b0d",
		timerDigits: "#ffffff",
		scrollerShadow: "#94a3b8",
		timerShadow: "#64748b",
	},
	{
		id: "paper",
		name: "Paper",
		scrollerBackground: "#0b0d12",
		scrollerDigits: "#f8fafc",
		timerBackground: "#ffffff",
		timerDigits: "#0b0b0d",
		scrollerShadow: "#64748b",
		timerShadow: "#000000",
	},
	{
		id: "amber",
		name: "Amber",
		scrollerBackground: "#0b0d12",
		scrollerDigits: "#fb923c",
		timerBackground: "#f97316",
		timerDigits: "#0b0b0d",
		scrollerShadow: "#7c2d12",
		timerShadow: "#7c2d12",
	},
];

export const DEFAULT_SKIN = SKINS[1];

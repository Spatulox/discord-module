import {ButtonBuilder, ButtonStyle, ClientEvents, SectionBuilder, TextDisplayBuilder} from 'discord.js';

export type ModuleEventsMap = Partial<Record<keyof ClientEvents, (...args: any[]) => any>>;

export abstract class Module     {
    public abstract name: string;
    public abstract description: string;
    private _enabled = false;

    public abstract get events(): ModuleEventsMap;

    public createModuleUI(): SectionBuilder {
        return new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${this.name}`))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${this.description}`))
            .setButtonAccessory(new ButtonBuilder().setLabel(this.enabled ? "Disabled" : "Enable").setCustomId(`toggle_${this.name.toLowerCase()}`).setStyle(this.enabled ? ButtonStyle.Danger : ButtonStyle.Success))
    }

    get enabled(): boolean {return this._enabled}
    toogleEnabled() {this._enabled = !this._enabled}
    enable() { this._enabled = true; }
    disable() { this._enabled = false; }
};
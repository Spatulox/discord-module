import {
    ButtonBuilder,
    ButtonStyle,
    ClientEvents,
    ContainerBuilder, InteractionReplyOptions, MessageFlags,
    SectionBuilder,
    TextDisplayBuilder
} from 'discord.js';

export type ModuleEventsMap = Partial<Record<keyof ClientEvents, (...args: any[]) => any>>;

export abstract class Module     {
    public abstract name: string;
    public abstract description: string;
    private _enabled = false;

    public abstract get events(): ModuleEventsMap;

    public createModuleUI(): SectionBuilder {
        if(`toggle_${this.name.toLowerCase()}`.length > 100){
            throw new Error(`In order to create the Module UI, buttons customId should not be more than 100 char, please reduce the name of your Module : ${this.name}`);
        }
        return new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${this.enabled ? "🟢" : "🔴"} ${this.name}`))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${this.description}`))
            .setButtonAccessory(new ButtonBuilder().setLabel(this.enabled ? "Disabled" : "Enable").setCustomId(`toggle_${this.name.toLowerCase()}`).setStyle(this.enabled ? ButtonStyle.Danger : ButtonStyle.Success))
    }

    public showModule(): InteractionReplyOptions {
        return {
            components: [new ContainerBuilder().addSectionComponents(this.createModuleUI())],
            flags: MessageFlags.IsComponentsV2,
        }
    }

    get enabled(): boolean {return this._enabled}
    toogleEnabled() {this._enabled = !this._enabled}
    enable() { this._enabled = true; }
    disable() { this._enabled = false; }
};
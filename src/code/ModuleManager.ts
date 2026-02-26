import {
    ButtonInteraction,
    Client,
    ContainerBuilder, Message, MessageEditOptions,
    MessageFlags, SeparatorBuilder, SeparatorSpacingSize,
    TextDisplayBuilder
} from "discord.js";
import {Module} from './Module';
import {MultiModule} from "./MultiModule";

type ModuleMap = Record<string, Module[]>

export class ModuleManager {
    private _modules: ModuleMap = {};
    private client: Client | null;
    private static instance: ModuleManager | null;
    private static message: Message | null = null;

    private constructor(client: Client) {
        this.client = client;
    }

    public static createInstance(client: Client): ModuleManager {
        ModuleManager.instance = new ModuleManager(client);
        return ModuleManager.instance;
    }

    public static getInstance(): ModuleManager | null {
        return ModuleManager.instance;
    }

    get modules(): ModuleMap { return this._modules; }

    register(module: Module | MultiModule): void {

        if(module instanceof MultiModule) {
            this.registerMod(module);
            for (const mod of module.subModules) {
                mod.setParent(module.name)
                if(mod instanceof MultiModule) {
                    throw new Error(`A Multi Module "${module.name}" cannot have a Multi Module as a Module : ${mod.name}`);
                }
                this.registerMod(mod);
            }
            return
        }
        this.registerMod(module);
    }

    private registerMod(module: Module): void {
        if (!this._modules[module.parent]) {
            this._modules[module.parent] = [];
        }
        this._modules[module.parent]!.push(module);
        this.bindEvents(module);
    }

    private createManagerUI(): ContainerBuilder {
        const container = new ContainerBuilder()
        container
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# Module Manager`))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`You can enable/disable any module`))
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large))

        for (const module of this._modules["root"]!) {
            container.addSectionComponents(module.createModuleUI());
        }

        return container;
    }

    private bindEvents(module: Module) {
        const eventsMap = module.events;

        for (const [eventName, method] of Object.entries(eventsMap)) {
            if (typeof method !== 'function') continue;
            // ✅ Automatic Binding
            this.client?.on(eventName, async (...args: any[]) => {
                if (module.enabled) {
                    await method(...args);
                }
            });
        }
    }

    enableAll() {
        Object.values(this._modules).forEach(modules =>
            modules.forEach(mod => mod.enable())
        );
    }

    disableAll() {
        Object.values(this._modules).forEach(modules =>
            modules.forEach(mod => mod.disable())
        );
    }

    getModule(name: string): Module | undefined {
        for (const parentModules of Object.values(this._modules)) {
            const found = parentModules.find(m =>
                m.name.toLowerCase() === name.toLowerCase()
            );
            if (found) return found;
        }
    }

    get enabledCount(): number {
        return Object.values(this._modules).flat().filter(m => m.enabled).length;
    }
    async sendUIToChannel(channelID: string){
        const channel = this.client?.channels.cache.get(channelID) || await this.client?.channels.fetch(channelID)
        if(!channel){
            throw new Error(`Channel (${channelID}) does not exist or is unavailable`);
        }
        if(channel.isTextBased() && channel.isSendable()){
            ModuleManager.message = await channel.send({
                components: [this.createManagerUI()],
                flags: MessageFlags.IsComponentsV2
            })
            return
        }
        throw new Error(`Channel (${channelID}) does not exist or is not a valid sendable channel`);
    }

    /**
     * Global update for the main message
     */
    private async updateMainUI(): Promise<void> {
        const m: MessageEditOptions = {
            components: [this.createManagerUI()],
        }
        await ModuleManager.message?.edit(m)
    }

    /**
     * This update the MultiModule component when a single module is updated
     * @param interaction
     * @param module
     */
    public updateMultiModuleUI(interaction: ButtonInteraction, module: Module): void {
        const manager = ModuleManager.getInstance()
        if(manager){
            if(module.parent == "root"){ // It's the MainUI, which is updated every click right now
                this.updateMainUI()
            }
            const parentMod = manager.getModule(module.parent)
            if(!parentMod || !(parentMod instanceof MultiModule)){
                if(!(module instanceof MultiModule) ){ // if it's a MultiModule, if the "all_toggle_${button}"
                    interaction.deferUpdate() // No Parent mod, so updateMainUI is the only one to be updated
                }
                return
            }
            parentMod.notifyChange(interaction)
            return
        }
        console.error("No existing manager")
    }

}
import {
    Client,
    ContainerBuilder,
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
            this.registerMod("root", module);
            for (const mod of module.subModules) {
                this.registerMod(module.name, mod);
            }
            return
        }
        this.registerMod("root", module);
        //console.log(this.modules);
    }

    private registerMod(parentName: string | "root", module: Module): void {
        if (!this._modules[parentName]) {
            this._modules[parentName] = [];
        }
        this._modules[parentName].push(module);
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
        //console.log(module);
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
            channel.send({
                components: [this.createManagerUI()],
                flags: MessageFlags.IsComponentsV2
            })
            return
        }
        throw new Error(`Channel (${channelID}) does not exist or is not a valid sendable channel`);
    }
}
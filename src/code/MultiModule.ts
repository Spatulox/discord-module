import { ModuleManager } from './ModuleManager.js';
import {
    ButtonInteraction,
    Client,
    ContainerBuilder,
} from 'discord.js';
import {Module, ModuleEventsMap} from "./Module";

export abstract class MultiModule extends Module {
    private readonly manager;

    protected abstract get subModules(): Module[];

    constructor(client: Client) {
        super()
        this.manager = new ModuleManager(client)
    }

    register(module: Module) {
        this.subModules.push(module);
        this.manager.register(module);
    }

    public get events(): ModuleEventsMap {
        return [] as ModuleEventsMap;
    }

    protected createSubmoduleUI(){
        const container = new ContainerBuilder();

        container.addSectionComponents(this.createModuleUI())

        for (const module of this.subModules) {
            container.addSectionComponents(module.createModuleUI())
        }

        return container;
    }


    override enable(interaction?: ButtonInteraction) {
        super.enable()
        this.notifyChange(interaction);
    }

    async enableAll(interaction?: ButtonInteraction) {
        this.manager.enableAll();
        this.notifyChange(interaction);
    }

    override disable(interaction?: ButtonInteraction) {
        super.disable()
        this.notifyChange(interaction);
    }

    async disableAll(interaction?: ButtonInteraction) {
        this.manager.disableAll();
        this.notifyChange(interaction);
    }

    toggleSubModule(subModuleName: string, interaction?: ButtonInteraction) {
        const module = this.manager.getModule(subModuleName);
        if (module) {
            this.toogleEnabled()
            this.notifyChange(interaction);
        }
    }

    // 📤 Notif UI unifiée
    private notifyChange(interaction?: ButtonInteraction) {
        if (!interaction) return;

        interaction.update({
            embeds: [{
                title: `${this.name} (${this.manager.modules.filter(m => m.enabled).length}/${this.subModules.length})`,
                color: this.isAnyEnabled() ? 0x00ff00 : 0xff0000
            }],
            components: [this.createSubmoduleUI()]
        });
    }

    private isAnyEnabled(): boolean {
        return this.manager.modules.some(m => m.enabled);
    }
}
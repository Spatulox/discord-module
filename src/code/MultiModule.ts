import { ModuleManager } from './ModuleManager.js';
import {
    ButtonInteraction,
    ContainerBuilder, InteractionReplyOptions, MessageFlags,
} from 'discord.js';
import {Module, ModuleEventsMap} from "./Module";

export abstract class MultiModule extends Module {
    private readonly manager;

    protected abstract readonly subModules: Module[];

    /*public get subModules(): Module[] {
        return this._subModules;
    };*/

    constructor() {
        super()
        const inst = ModuleManager.getInstance()
        if(inst){
            this.manager = inst
        } else {
            throw new Error("Module Manager Instance is null")
        }
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

    override showModule(): InteractionReplyOptions{
        return {
            components: [this.createSubmoduleUI()],
            flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
        }
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

    private notifyChange(interaction?: ButtonInteraction) {
        if (!interaction) return;

        const flatModules = Object.values(this.manager.modules).flat();

        interaction.update({
            embeds: [{
                title: `${this.name} (${flatModules.filter(m => m.enabled).length}/${this.subModules.length})`,
                color: this.isAnyEnabled() ? 0x00ff00 : 0xff0000
            }],
            components: [this.createSubmoduleUI()]
        });
    }

    private isAnyEnabled(): boolean {
        return Object.values(this.manager.modules).flat().some(m => m.enabled);
    }

}
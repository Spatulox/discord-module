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

        container.addSectionComponents(this.createModuleUI("all"))

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
        this.subModules.forEach(module => {
            module.enable();
        })
        this.enable(interaction);
    }

    override disable(interaction?: ButtonInteraction) {
        super.disable()
        this.notifyChange(interaction);
    }

    async disableAll(interaction?: ButtonInteraction) {
        this.subModules.forEach(module => {
            module.disable();
        })
        this.disable(interaction);
    }

    public notifyChange(interaction?: ButtonInteraction) {
        if (!interaction) return;

        interaction.update({
            components: [this.createSubmoduleUI()]
        });
    }

    public isAnyEnabled(): boolean {
        return Object.values(this.manager.modules).flat().some(m => m.enabled);
    }

}
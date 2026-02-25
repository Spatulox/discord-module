import {Client} from "discord.js";
import {Module} from './Module';

export class ModuleManager {
    private modules: Module[] = [];

    constructor(private client: Client) {
    }

    register(module: Module) {
        this.modules.push(module);
        this.bindEvents(module);
    }

    private bindEvents(module: Module) {
        const eventsMap = module.events;

        for (const [eventName, method] of Object.entries(eventsMap)) {
            if (typeof method !== 'function') continue;
            // ✅ Automatic Binding
            this.client.on(eventName, async (...args: any[]) => {
                if (module.enabled) {
                    await method(...args);
                }
            });
        }
    }

    enableAll() {
        this.modules.forEach(mod => mod.enable());
    }

    disableAll() {
        this.modules.forEach(mod => mod.disable());
    }

    getModule(name: string) {
        return this.modules.find(m => m.name === name);
    }
}
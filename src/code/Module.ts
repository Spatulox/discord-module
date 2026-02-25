import {ClientEvents} from 'discord.js';

export type ModuleEventsMap = Partial<Record<keyof ClientEvents, (...args: any[]) => any>>;

export abstract class Module     {
    public abstract name: string;
    public abstract description: string;
    public enabled = false;

    public abstract get events(): ModuleEventsMap;

    enable() { this.enabled = true; }
    disable() { this.enabled = false; }
};
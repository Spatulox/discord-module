import {Module, ModuleEventsMap} from "../../code/Module";

export class RandomModule extends Module {
    public name: string = "Random";
    public description: string = "Raomdom";
    public get events(): ModuleEventsMap {
        return {}
    }
}
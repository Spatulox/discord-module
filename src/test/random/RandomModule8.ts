import {Module, ModuleEventsMap} from "../../code/Module";

export class RandomModule8 extends Module {
    public name: string = "Random8";
    public description: string = "Raomdom";
    public get events(): ModuleEventsMap {
        return {}
    }
}
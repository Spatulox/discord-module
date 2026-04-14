import {Module, ModuleEventsMap} from "../../code/Module";

export class RandomModule4 extends Module {
    public name: string = "Random4";
    public description: string = "Raomdom";
    public get events(): ModuleEventsMap {
        return {}
    }
}
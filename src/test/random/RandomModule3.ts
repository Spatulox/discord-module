import {Module, ModuleEventsMap} from "../../code/Module";

export class RandomModule3 extends Module {
    public name: string = "Random3";
    public description: string = "Raomdom";
    public get events(): ModuleEventsMap {
        return {}
    }
}
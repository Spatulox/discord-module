import {Module, ModuleEventsMap} from "../../code/Module";

export class RandomModule6 extends Module {
    public name: string = "Random6";
    public description: string = "Raomdom";
    public get events(): ModuleEventsMap {
        return {}
    }
}
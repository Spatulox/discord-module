import {Module, ModuleEventsMap} from "../../code/Module";

export class RandomModule9 extends Module {
    public name: string = "Random9";
    public description: string = "Raomdom";
    public get events(): ModuleEventsMap {
        return {}
    }
}
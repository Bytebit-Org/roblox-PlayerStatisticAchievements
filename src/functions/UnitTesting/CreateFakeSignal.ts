/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { AnyArgs, ISignal } from "@rbxts/signals-tooling";
import { RunService } from "@rbxts/services";

type SignalConnection = {
	readonly Connected: boolean;
	Disconnect(): void;
};

export const createFakeSignal: <T extends AnyArgs>() => ISignal<T> = <T extends AnyArgs>() => {
	const handlers = new Array<T>();
	const connections = new Array<SignalConnection>();

	const connectFunction = function (handlerFunction: T) {
		handlers.push(handlerFunction);

		const signalConnection = {
			Connected: true,
			Disconnect: function (this: SignalConnection) {
				if (!signalConnection.Connected) {
					return;
				}

				let removeIndex = handlers.size() + 1;

				for (let i = 0; i < handlers.size(); i++) {
					if (handlers[i] === handlerFunction) {
						removeIndex = i;
						break;
					}
				}
				handlers.unorderedRemove(removeIndex);

				for (let i = 0; i < connections.size(); i++) {
					if (connections[i] === signalConnection) {
						removeIndex = i;
						break;
					}
				}
				connections.unorderedRemove(removeIndex);

				signalConnection.Connected = false;
			},
		};

		connections.push(signalConnection);

		return signalConnection;
	};

	const destroyFunction = function () {
		const tempConnections = [...connections];
		for (let i = 0; i < tempConnections.size(); i++) {
			tempConnections[i].Disconnect();
		}
	};

	const fireFunction = function (...args: Parameters<T>) {
		const tempHandlers = [...handlers];
		for (let i = 0; i < tempHandlers.size(); i++) {
			tempHandlers[i](...args);
		}
	};

	const waitFunction = function () {
		let stillWaiting = true;
		let resultingArgs!: Parameters<T>;
		const handlerFunction = (...args: Parameters<T>) => {
			resultingArgs = args;
			stillWaiting = false;
		};
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		connectFunction(handlerFunction as T);

		while (stillWaiting) {
			RunService.Heartbeat.Wait();
		}

		return resultingArgs;
	};

	return ({
		connect: function (this: unknown, ...args: Parameters<typeof connectFunction>) {
			return connectFunction(...args);
		},
		Connect: function (this: unknown, ...args: Parameters<typeof connectFunction>) {
			return connectFunction(...args);
		},

		destroy: destroyFunction,
		Destroy: destroyFunction,

		wait: function (this: unknown, ...args: Parameters<typeof waitFunction>) {
			return waitFunction(...args);
		},
		Wait: function (this: unknown, ...args: Parameters<typeof waitFunction>) {
			return waitFunction(...args);
		},

		fire: function (this: unknown, ...args: Parameters<typeof fireFunction>) {
			return fireFunction(...args);
		},
	} as unknown) as ISignal<T>;
};

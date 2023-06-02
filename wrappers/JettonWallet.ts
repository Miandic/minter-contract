import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type JettonWalletConfig = {
    balance: bigint,
    owner_address: Address,
    jetton_master_address: Address,
    jetton_wallet_code: Cell
};

export function jettonWalletConfigToCell(config: JettonWalletConfig): Cell {
    return beginCell().endCell();
}

export const constAmounts = {
    min_tons_for_storage: 10000000,
    gas_consumption: 10000000
};

export class JettonWallet implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new JettonWallet(address);
    }

    static createFromConfig(config: JettonWalletConfig, code: Cell, workchain = 0) {
        const data = jettonWalletConfigToCell(config);
        const init = { code, data };
        return new JettonWallet(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendTransfer(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        forwardValue: bigint,
        recipient: Address,
        amount: bigint
    ) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x0f8a7ea5, 32)
                .storeUint(0, 64)
                .storeCoins(amount)
                .storeAddress(recipient)
                .storeAddress(via.address)
                .storeUint(0, 1)
                .storeCoins(forwardValue)
                .storeUint(0, 1)
                .endCell(),
            value: value + forwardValue,
        });
    }

    async getBalance(provider: ContractProvider): Promise<bigint> {
        return (await provider.get('get_wallet_data', [])).stack.readBigNumber();
    }
}

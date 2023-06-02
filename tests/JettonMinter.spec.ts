import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { JettonMinter } from '../wrappers/JettonMinter';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('JettonMinter', () => {
    let code: Cell;
    let codeWallet: Cell;

    beforeAll(async () => {
        code = await compile('JettonMinter');
        codeWallet = await compile('JettonWallet');
    });

    let blockchain: Blockchain;
    let jettonMinter: SandboxContract<JettonMinter>;
    let deployer: SandboxContract<TreasuryContract>;
    let wallet: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');

        jettonMinter = blockchain.openContract(
            JettonMinter.createFromConfig(
                {
                    total_supply: toNano('100'),
                    admin_address: deployer.address,
                    content: Cell.EMPTY,
                    jetton_wallet_code: codeWallet,
                }, code));

        const deployResult = await jettonMinter.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: jettonMinter.address,
            deploy: true,
            success: true,
        });
    });

    it('should get minter initialization data correctly', async () => {
        const call = await JettonMinter.getJettonData(deployer.getSender())
        console.log(call)
    });
});

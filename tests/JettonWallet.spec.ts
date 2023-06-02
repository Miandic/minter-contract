import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { JettonWallet } from '../wrappers/JettonWallet';
import { JettonMinter } from '../wrappers/JettonMinter';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('JettonWallet', () => {
    let code: Cell;
    let codeWallet: Cell;

    beforeAll(async () => {
        code = await compile('JettonWallet');
        codeWallet = await compile('JettonWallet');
    });

    let blockchain: Blockchain;
    let jettonWallet: SandboxContract<JettonWallet>;
    let deployer: SandboxContract<TreasuryContract>;
    let wallet: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        
        deployer = await blockchain.treasury('deployer');

        jettonWallet = blockchain.openContract(
            JettonWallet.createFromConfig(
                {
                    balance: toNano(100),
                    owner_address: deployer.address,
                    jetton_master_address: JettonMinter.address,
                    jetton_wallet_code: codeWallet,
                }, code));


        const deployResult = await jettonWallet.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: jettonWallet.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and jettonWallet are ready to use
    });
});

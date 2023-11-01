import {BaseError, ContractFunctionExecutionError, ContractFunctionRevertedError} from "viem";

export interface TransactionResult {
    id: string;
    name: string;
    message: string;
    amount: string;
    timestamp: string;
}

// donor interface
export interface Donor {
    id: number;
    name: string;
    message: string;
    amount: number;
    timestamp: number;
}

export const mapResultsFromTx = (results: TransactionResult[]): Donor[] => {
    return results
        // .filter(
        //     tx =>
        //         tx.tx_type === 'contract_call' && tx.contract_call.function_name === 'buy-coffee'
        // )
        .map((donor, index) => {
            return {
                id: Number(donor.id),
                name: donor.name,
                message: donor.message,
                amount: Number(donor.amount),
                timestamp: Number(donor.timestamp)
            };
        }).reverse();
}

export const getError = (error: any): [number, string] => {
    let _code: number = 0;
    let _message: string = "";
    let _error: any = null;
    if (error instanceof BaseError) {
        const revertError: Error|null = error.walk(err => err instanceof ContractFunctionRevertedError)
        const executionError: Error|null = error.walk(err => err instanceof ContractFunctionExecutionError)
        if(executionError instanceof ContractFunctionExecutionError) {
            _code = 2;
            _message = executionError?.details?.split("##")[1];
        } else if (revertError instanceof ContractFunctionRevertedError && revertError?.data?.args) {
            _code = 1;
            // @ts-ignore
            _message = revertError?.data?.args[0].split("##")[1];
        }
    } else {
        _code = error?.data?.code ?? error?.code ?? 0;
        _error = error?.data?.message ?? error?.message ?? "";
        // keep all string after the first "##"
        _message = _error?.split("##")[1];
    }
    return [_code, _message];
}
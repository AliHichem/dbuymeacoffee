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
    let _smFound: boolean = false;
    const token = '##';
    if (error instanceof BaseError) {
        const revertError: Error | null = error.walk(err => err instanceof ContractFunctionRevertedError)
        const executionError: Error | null = error.walk(err => err instanceof ContractFunctionExecutionError)
        if (executionError instanceof ContractFunctionExecutionError) {
            _code = 2;
            if (executionError?.details) {
                _message = executionError?.details;
                if (_message.includes(token)) {
                    _smFound = true;
                    _message = _message.split("##")[1];
                }
            } else if (executionError?.shortMessage && !_smFound) {
                _message = executionError?.shortMessage;
                if (_message.includes(token)) {
                    _message = executionError?.shortMessage?.split("##")[1]
                }
            }
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
    console.log('>>>>> error.constructor.name <<<<', error.constructor.name);
    //if _message is empty or undefined throw full error
    if (_message === undefined || _message === "") {
        console.log('@@@@ Vanilla Js Error: ', error);
        alert(error);
    }
    return [_code, _message];
}
export default function Page() {
    return (
        <>
            <div className="mx-auto mt-8">
                <div className="text-lg font-medium leading-6 text-gray-900 flex space-x-2">
                    <div>Building a full-stack dapp on Stacks</div>
                </div>
                <div className="mt-2 text-sm text-gray-500 max-w-2xl">
                    This is a demo app on how to build an simple dapp with clarity smart contracts
                    and Stacks.js. Feel free grab some testnet STX from the {''}
                    <span className="text-blue-600 font-semibold hover:underline cursor-pointer">
                  <NewTabLink href="https://explorer.stacks.co/sandbox/deploy?chain=testnet">
                    faucet
                  </NewTabLink>
                </span>{' '}
                    to try out the app. Contracts are deployed on{' '}
                    <span className="text-blue-600 font-semibold hover:underline cursor-pointer">
                  <NewTabLink
                      href="https://explorer.stacks.co/txid/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.coffee?chain=testnet">
                    testnet
                  </NewTabLink>
                </span>
                    . You can find a source code on{' '}
                    <span className="text-gray-800 font-semibold hover:underline cursor-pointer">
                  <NewTabLink href="https://github.com/tuanphungcz/buy-me-a-coffee-with-stacks">
                    Github
                  </NewTabLink>
                </span>
                </div>
            </div>
            <div className="md:flex gap-4 justify-center pt-8 max-w mb-16">
                <div className="flex flex-col gap-4">
                    <ProfileCard profile={profile}/>
                    <Card>
                        <div className="p-8">
                            <div className="font-semibold text-base text-zinc-800">
                                Recent supporters {supporters && `(${supporters})`}
                            </div>
                            {txs?.map(tx => (
                                <div
                                    key={tx.id}
                                    className="flex border-b last:border-b-0 py-4 space-x-4 items-start"
                                >
                                    <div className="text-4xl w-12 h-12 flex justify-center items-center">
                                        {([1, 3, 5].includes(tx.amount) && '☕️') || '🔥'}
                                    </div>
                                    <div className="w-full">
                                        <div className="flex items-center justify-between">
                                            <div className=" text-sm text-zinc-600">
                                                <span className="font-semibold">{tx?.name || 'Someone'}</span>{' '}
                                                bought <span className="font-semibold">{tx.amount}</span>{' '}
                                                coffee(s)
                                            </div>
                                            <NewTabLink
                                                href={`${explorerUrl}/txid/${tx.id}`}
                                                className={`text-xs hover:underline cursor-pointer ${
                                                    tx.txStatus === 'pending'
                                                        ? 'text-orange-500'
                                                        : 'text-zinc-600'
                                                }`}
                                            >
                                                {tx.txStatus === 'success' ? '🚀' : '⌛'} {truncateUrl(tx.id)}
                                            </NewTabLink>
                                        </div>
                                        <div className="text-xs mt-1 text-zinc-600">
                                            {tx?.timestamp ? (
                                                new Date(tx?.timestamp * 1000).toLocaleString()
                                            ) : (
                                                <div className="text-orange-500">Transaction is pending</div>
                                            )}
                                        </div>
                                        {tx?.message && (
                                            <div
                                                className="border mt-4 border-blue-300 rounded w-fit bg-blue-50 px-4 py-2 text-sm text-zinc-600 flex space-x-2">
                                                <span className="text-lg">💬</span> <span>{tx.message}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="mt-4 sm:mt-0">
                    <Card>
                        <div className="p-8 items-center text-center mx-auto w-full">
                            <div className="flex justify-between">
                                <div className="font-semibold text-lg mb-4 text-left">
                                    Buy <span className="font-bold text-blue-500">Tuan</span> a coffee
                                    with Ӿ
                                </div>

                                <div>
                                    <div
                                        className="ml-2 rounded-xl capitalize inline-flex border px-2 py-0.5 text-xs font-semibold text-zinc-500">
                                        {process.env.NEXT_PUBLIC_NETWORK || 'devnet'}
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-2">
                                <div
                                    className="flex space-x-4   items-center bg-blue-50 border-blue-200 border rounded p-4">
                                    <div className="text-4xl">☕️</div>
                                    <div className="text-xl text-blue-500 font-bold">x</div>

                                    <SelectItem setPrice={setPrice} price={price} currentValue={1}/>
                                    <SelectItem setPrice={setPrice} price={price} currentValue={3}/>
                                    <SelectItem setPrice={setPrice} price={price} currentValue={5}/>

                                    <div className="w-10">
                                        <Input type="number" value={price} onChange={handlePriceChange}/>
                                    </div>
                                </div>

                                <Input
                                    value={name}
                                    onChange={handleNameChange}
                                    placeholder="Name or @twitter (optional)"
                                    label="Name"
                                />
                                <TextArea
                                    value={message}
                                    rows={6}
                                    onChange={handleMessageChange}
                                    placeholder="Thank you for the support. Feel free to leave a comment below. It could be anything – appreciation, information or even humor ... (optional)"
                                    label="Message"
                                />
                                {mounted && userSession.isUserSignedIn() ? (
                                    <PrimaryButton type="submit">Support with Ӿ{price}</PrimaryButton>
                                ) : (
                                    <PrimaryButton onClick={authenticate} type="button">
                                        <div className="flex space-x-2 items-center">
                                            <img src="/hiro.jpg" className="h-5 w-6"/>
                                            <div>Authenticate</div>
                                        </div>
                                    </PrimaryButton>
                                )}
                            </form>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}
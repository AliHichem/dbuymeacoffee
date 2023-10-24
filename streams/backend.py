from flask import Flask, request, jsonify
from flask_cors import CORS
from email.message import EmailMessage
from decouple import config
from jinja2 import Environment, FileSystemLoader, select_autoescape

import ssl
import smtplib

emailPass = config('EMAIL_PASS')
emailUser = config('EMAIL_USER')
emailReceiver = config('EMAIL_RECEIVER')
emailSubject = config('EMAIL_SUBJECT')

app = Flask(__name__)
CORS(app)

def getNetwork(chainId):
    switcher = {
        "0xaa36a7": "Sepolia Testnet",
        "0x1": "Mainnet",
        "0x3": "Ropsten",
        "0x4": "Rinkeby",
        "0x5": "Goerli",
        "0x2a": "Kovan"
    }
    return switcher.get(chainId, "Invalid network")

def send_template_email(template, to, subj, **kwargs):
    """Sends an email using a template."""
    env = Environment(
        loader=FileSystemLoader('templates'),
        autoescape=select_autoescape(['html', 'xml'])
    )
    template = env.get_template(template)
    send_email(to, subj, template.render(**kwargs))

def send_email(to, subj, body):
    """Sends an email."""
    em = EmailMessage()
    em['Subject'] = subj
    em['From'] = emailUser
    em['To'] = to
    em.set_content(body, subtype='html')
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(emailUser, emailPass)
        server.sendmail(emailUser, emailReceiver, em.as_string())

@app.route('/streams', methods=['POST'])
def streams():

    if (request.json['confirmed']):
        return jsonify(success=True)

    details = request.json

    for donation in details['txs']:
        amount = int(donation['value'])/1000000000000000000

        send_template_email(
            template='newdonation.html',
            to=emailReceiver,
            subj=emailSubject + " on " + getNetwork(details['chainId']),
            content="<b>"+donation['fromAddress'] + "</b> has just sent to you <b>" + str(amount) + "</b> Ether! on <b>" + getNetwork(details['chainId'])+ "</b>",
            transaction='https://sepolia.etherscan.io/tx/' + donation['hash'],
        )

    ## Example of details
    #     {
    #        "confirmed":false,
    #        "chainId":"0xaa36a7",
    #        "abi":[
    #
    #        ],
    #        "streamId":"c66c9918-8422-4b26-8825-1e46b324052f",
    #        "tag":"demo",
    #        "retries":0,
    #        "block":{
    #           "number":"4484760",
    #           "hash":"0x31d971962c92003c75ea12bce8e9df90bfbc9ad6684ba7936bd0c9bee17c4679",
    #           "timestamp":"1697230308"
    #        },
    #        "logs":[
    #
    #        ],
    #        "txs":[
    #           {
    #              "hash":"0x9ff77c23948c01cd0a9f2151208f11eeb1b8a665fb789452b51b6b2d11c47b43",
    #              "gas":"245588",
    #              "gasPrice":"1500000007",
    #              "nonce":"4",
    #              "input":"0xfac516c2000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000004a4665656c2066726565206772616220736f6d6520746573746e6574204554482066726f6d20746865205365706f6c696146617563657420746f20747279206f757420746865206170702e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000135468697264207465737420646f6e6174696f6e00000000000000000000000000",
    #              "transactionIndex":"13",
    #              "fromAddress":"0x5515e7e6fb3da474b287f2c063bf41258ab7d21a",
    #              "toAddress":"0x7a10362d75cc01b15740c6d9bbd1e66852c83616",
    #              "value":"3000000000000000",
    #              "type":"2",
    #              "v":"0",
    #              "r":"39711029626784005034449709726081985476879185764922882353877439660122210110868",
    #              "s":"15347269812478168043106081209217768123204747930534740134841495916724545361680",
    #              "receiptCumulativeGasUsed":"2262427",
    #              "receiptGasUsed":"242231",
    #              "receiptContractAddress":"None",
    #              "receiptRoot":"None",
    #              "receiptStatus":"1"
    #           }
    #        ],
    #        "txsInternal":[
    #
    #        ],
    #        "erc20Transfers":[
    #
    #        ],
    #        "erc20Approvals":[
    #
    #        ],
    #        "nftTokenApprovals":[
    #
    #        ],
    #        "nftApprovals":{
    #           "ERC721":[
    #
    #           ],
    #           "ERC1155":[
    #
    #           ]
    #        },
    #        "nftTransfers":[
    #
    #        ],
    #        "nativeBalances":[
    #
    #        ]
    #     }


    return jsonify(success=True)

if __name__ == '__main__':
    app.run(host="127.0.0.1", port="3000", debug=True)
'use client'

import Link from "next/link";
import {motion} from "framer-motion"

import '@/app/assets/css/icomoon.css'
import '@/app/assets/css/bootstrap.css'
import '@/app/assets/css/style.css'
import {Kaushan_Script} from "next/font/google";
const kaushanScript = Kaushan_Script({subsets: ['latin-ext'], weight: '400'});

export default function Page() {

    return (
        <motion.div
            initial={{opacity: 0, scale: 1}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.5}}
        >
            <div id="page">
                <header id="fh5co-header" className="fh5co-cover js-fullheight" role="banner"
                        style={{backgroundImage: `url("/images/cover_bg_3.jpg")`}} data-stellar-background-ratio="0.5">
                    <div className="overlay"></div>
                    <div className="container">
                        <div className="row">
                            <div className="col-md-8 col-md-offset-2 text-center">
                                <div className="display-t js-fullheight">
                                    <div className="display-tc js-fullheight animate-box" data-animate-effect="fadeIn">
                                        <div className="profile-thumb" style={{
                                            backgroundImage: `url("/images/ali.jpeg")`
                                        }}></div>
                                        <h1 className={kaushanScript.className} ><span>Hichem Ali</span></h1>
                                        <h3 className={kaushanScript.className} ><span>Web Developer</span></h3>
                                        <ul className="fh5co-social-icons">
                                            <li><a href="https://github.com/AliHichem"><i
                                                className="icon-github2"></i></a></li>
                                            <li><a href="https://www.facebook.com/hikemu"><i
                                                className="icon-facebook2"></i></a></li>
                                            <li><a href="https://www.linkedin.com/in/alihichem"><i
                                                className="icon-linkedin2"></i></a></li>
                                            <li><a href="mailto:ali.hichem@mail.com"><i className="icon-email"></i></a>
                                            </li>
                                            <li><Link href={'/buymeacoffee'} legacyBehavior>
                                                <a target="_blank">
                                                    <i className="icon-cup"></i>
                                                </a>
                                            </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            </div>
        </motion.div>
    )
}
'use client'

import Link from "next/link";
import {motion} from "framer-motion"

import '../assets/css/icomoon.css'
import '../assets/css/bootstrap.css'
import '../assets/css/style.css'

export default function Home({Component, pageProps, router}) {

    return (
        <motion.div
            initial={{opacity: 0, scale: 1}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.5}}
        >
            <div id="page">
                <header id="fh5co-header" className="fh5co-cover js-fullheight" role="banner"
                        style={{
                            backgroundImage: `url("/images/cover_bg_3.jpg")`,
                            className: 'fh5co-cover',
                            role: 'banner'
                        }} data-stellar-background-ratio="0.5">
                    <div className="overlay"></div>
                    <div className="container">
                        <div className="row">
                            <div className="col-md-8 col-md-offset-2 text-center">
                                <div className="display-t js-fullheight">
                                    <div className="display-tc js-fullheight animate-box" data-animate-effect="fadeIn">
                                        <div className="profile-thumb" style={{
                                            backgroundImage: `url("/images/ali.jpeg")`
                                        }}></div>
                                        <h1><span>Hichem Ali</span></h1>
                                        <h3><span>Web Developer</span></h3>
                                        <ul className="fh5co-social-icons">
                                            <li><a href="https://github.com/AliHichem"><i
                                                className="icon-github2"></i></a></li>
                                            <li><a href="https://www.facebook.com/hikemu"><i
                                                className="icon-facebook2"></i></a></li>
                                            <li><a href="https://www.linkedin.com/in/alihichem"><i
                                                className="icon-linkedin2"></i></a></li>
                                            <li><a href="mailto:ali.hichem@mail.com"><i className="icon-email"></i></a>
                                            </li>
                                            <li><Link href={'/buymeacoffee'}><i className="icon-cup"></i></Link>
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
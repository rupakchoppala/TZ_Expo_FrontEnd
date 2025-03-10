import React, { useState } from "react";
import { useEffect } from "react";
import Layout from "../layouts/Layout";
import Container from "../components/ui/container";
import cctv from "../assets/cctv.mp4";
import { useNavigate } from "react-router-dom";
import {VideoOff} from "lucide-react";




const CemarasPage = ({className,children})=>{
    const navigate = useNavigate();

    const [date,setDate] = useState("");
    const [time,setTime] = useState("");
    const data = [
        {
            id:1,
            status:true
        },
        {
            id:2,
            status:true
        },
        {
            id:3,
            status:true
        },
        {
            id:4,
            status:false
        },
        {
            id:5,
            status:true
        },
        {
            id:6,
            status:false
        },
    ];
    useEffect(()=>{
        const now = new Date();
        const timeInterval = setInterval(()=>{
            setDate(now.toLocaleDateString());
            setTime(now.toLocaleTimeString());
        },1000);

        return ()=> clearInterval(timeInterval);
    }); 

    return(
        <Layout>
            <div className="w-full h-auto flex flex-col justify-center items-start gap-8 p-2">
                <h1 className=" text-start text-3xl font-bold text-zinc-900"> CCTV Footage</h1>
                <div className="w-full h-auto flex flex-col justify-start items-start gap-4">
                    <div className="w-full h-auto flex flex-row justify-start items-center gap-6">
                        <p className="text-[14px] text-zinc-900 font-medium flex flex-row justify-center items-center gap-2"><span className="inline-block w-[7px] h-[7px] rounded-full bg-green-500"></span><span className="inline-block">4 Cemaras Activated</span></p>
                    </div>
                    <div className="w-full h-auto grid grid-cols-3 gap-6">
                        {
                            data.map((item,index)=>{
                                return(
                                    <Container onClick={()=>{navigate("/webcam")}}  key={item.id} className={"relative group w-full h-[200px] rounded-2xl p-0 hover:cursor-pointer transition-all duration-300 ease-in-out"}>
                                        {item.status? <video autoPlay loop muted className="w-full h-full object-cover z-40 rounded-2xl">
                                            <source src={cctv} type="video/mp4" />
                                            browser not suppoted
                                        </video>: 
                                        <div className="w-full h-full flex flex-col justify-center items-center bg-zinc-600/60 rounded-2xl">
                                            <VideoOff className="w-16! h-16! text-zinc-900 group-hover:opacity-40"/>
                                        </div>
                                        }
                                        <div className={`absolute top-3 right-4 ${item.status?"flex": "hidden"} flex-row justify-center items-center gap-2 z-[60]`}>
                                            <span class="relative flex justify-center items-center size-3">
                                                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                                <span class="relative inline-flex size-2 rounded-full bg-red-500"></span>
                                            </span>
                                            <p className="text-base font-semibold text-white">Live</p>
                                        </div>
                                        <p className="absolute left-4 top-2 text-lg text-white font-bold">{`Cemara ${item.id}`}</p>
                                        <p className="w-full h-auto absolute bottom-2 flex flex-row justify-between items-center text-sm text-white font-medium px-4"><span >{date}</span> <span>{time}</span></p>
                                        
                                    </Container>
                                );
                            })
                        }
                        
                        
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default CemarasPage;
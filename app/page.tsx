"use client"
import { ModeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider'
import { Camera, FlipHorizontal, PersonStanding, Video, Volume2 } from 'lucide-react';
import React, {useEffect,useId,useRef, useState } from 'react'
import Webcam from 'react-webcam';
import { toast } from "sonner"
import {Rings} from "react-loader-spinner"
import { beep } from '@/utils/audio';
import * as cocossd from '@tensorflow-models/coco-ssd'
import "@tensorflow/tfjs-backend-cpu"
import "@tensorflow/tfjs-backend-webgl"
import { ObjectDetection } from '@tensorflow-models/coco-ssd';


type Props = {}
let interval : any = null;
const HomePage = (props :Props) => {
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // state
  const [mirrored, setMirrored] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [autoRecordEnabled, setAutoRecordEnabled] = useState<boolean>(false);
  const [volume, setVolume] = useState(0.8);
  const [model,setModel] = useState<ObjectDetection>();
  const [loading,setLoading] = useState(false);
  //tensorflow-model
  useEffect(()=>{
    setLoading(true);
    initModel();
  },[])

  //loads model
  //set it  in a state variable

  async function initModel(){
    const loadModel : ObjectDetection = await cocossd.load({
      base:'mobilenet_v2'
    })
    setModel(loadModel)
  }


  useEffect(()=>{
    if(model){
      setLoading(false);
    }
  },[model])


  async function runPrediciton(){
    if(
    model
    && webcamRef.current
    && webcamRef.current.video
    && webcamRef.current.video.readyState === 4
    ){
      const predicitons = await  model.detect(webcamRef.current.video)
    }
  }
  useEffect(()=>{
    interval = setInterval(()=>{
      runPrediciton();
    },1000)

    return ()=> clearInterval(interval);
  },[webcamRef.current, model])
 return (

    <div className='flex h-screen'>
      {/* Left division - webcam and Canvas  */}
      <div className='relative'>
        <div className='relative h-screen w-full'>
          <Webcam ref={webcamRef}
            mirrored={mirrored}
            className='h-full w-full object-contain p-2'
          />
          <canvas ref={canvasRef}
            className='absolute top-0 left-0 h-full w-full object-contain'
          ></canvas>
        </div>
      </div>

      {/* Righ division - container for buttion panel and wiki secion  */}
      <div className='flex flex-row flex-1'>
        <div className='border-primary/5 border-2 max-w-xs flex flex-col gap-2 justify-between shadow-md rounded-md p-4'>
          {/* top secion  */}
          <div className='flex flex-col gap-2'>
            <ModeToggle />
            <Button
              variant={'outline'} size={'icon'}
              onClick={() => {
                setMirrored((prev) => !prev)
              }}
            ><FlipHorizontal /></Button>

            <Separator className='my-2' />
          </div>
          {/* Middle section  */}
          <div className='flex flex-col gap-2'>
            <Separator className='my-2' />
             <Button
              variant={'outline'} size={'icon'}
              onClick={userPromptScreenshot}
             >
               <Camera />
             </Button>
             <Button
              variant={isRecording ? 'destructive' : 'outline'} size={'icon'}
              onClick={userPromptRecord}
             >
               <Video />
             </Button>
            <Separator className='my-2' />
             <Button
              variant={autoRecordEnabled ? 'destructive' : 'outline'}
              size={'icon'}
              onClick={toggleAutoRecord}
             >
              {autoRecordEnabled ? <Rings color='white' height={45} />: <PersonStanding />}
             </Button>
            <Separator className='my-2' />
          </div>
          {/* Bottom Secion  */}
          <div className='flex flex-col gap-2'>
           <Separator className='my-2' />

              <Popover>
              <PopoverTrigger asChild>
                <Button variant={'outline'} size={'icon'}>
                  <Volume2 />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Slider
                  max={1}
                  min={0}
                  step={0.2}
                  defaultValue={[volume]}
                  onValueCommit={(val) => {
                    setVolume(val[0]);
                    beep(val[0]);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
      </div>
      {loading && <div className='z-50 absolute w-full h-full flex items-center justify-center bg-primary-foreground'>
        Getting things ready . . . <Rings height={50} color='red' />
        </div>
      }
      </div>
    </div>
  )

  // handler functions

  function userPromptScreenshot() {

    // take picture
   // save it to downloads

  }

  function userPromptRecord() {

     }

  function toggleAutoRecord() {
    if (autoRecordEnabled) {
      setAutoRecordEnabled(false);
      toast('Autorecord disabled')
      // show toast to user to notify the change

    } else {
      setAutoRecordEnabled(true);
      toast('Autorecord enabled')
      // show toast
    }

  }
}
export default HomePage

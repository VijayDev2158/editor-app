import {useState, useRef, useEffect} from 'react'
import '../editor.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome' 
import {faVolumeMute, faVolumeUp, faPause, faPlay, faGripLinesVertical, faSync, faStepBackward, faStepForward, faCamera, faDownload, faEraser} from '@fortawesome/free-solid-svg-icons' // https://fontawesome.com/v5/docs/web/use-with/react

import {createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg'

function Editor({videoUrl, timings, setTimings}) {

	
	const [isMuted, setIsMuted] = useState(false)

	const [playing, setPlaying] = useState(false)

	const [difference, setDifference] = useState(0.2)

	const [deletingGrabber, setDeletingGrabber] = useState(false)

	const [currentWarning, setCurrentWarning] = useState(null)

	const [imageUrl, setImageUrl] = useState('')

	const [trimmingDone, setTrimmingDone] = useState(false)

	const [seekerBar, setSeekerBar] = useState(0)


	const currentlyGrabbedRef = useRef({'index': 0, 'type': 'none'})

	const trimmedVidRef = useRef()

	const playVideoRef = useRef()

	const progressBarRef = useRef()

	const playBackBarRef = useRef()

	const warnings = {'delete_grabber': (<div>Please click on the grabber (either start or end) to delete it</div>)}

	const [trimmedVideo, setTrimmedVideo] = useState()

	const [progress, setProgress] = useState(0)

	const [ready, setReady] = useState(false)

	const ffmpeg = useRef(null)


	const load = async () => {
		try{
			await ffmpeg.current.load()

			setReady(true)
		}
		catch(error) {
			console.log(error)
		}
	}

	useEffect(() => {
		ffmpeg.current = createFFmpeg({
			log: true,
			corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js'
		})
		load()
	}, [])


	useEffect(() => {
		if(playVideoRef.current.onloadedmetadata) {
			const currentIndex = currentlyGrabbedRef.current.index
			const seek = (playVideoRef.current.currentTime - timings[0].start) / playVideoRef.current.duration * 100
			setSeekerBar(seek)
			progressBarRef.current.style.width = `${seekerBar}%`
			if((playVideoRef.current.currentTime >= timings[0].end)) {
				playVideoRef.current.pause()
				setPlaying(false)
				currentlyGrabbedRef.current = ({'index': currentIndex + 1, 'type': 'start'})
				progressBarRef.current.style.width = '0%'
				progressBarRef.current.style.left = `${timings[0].start / playVideoRef.current.duration * 100}%`
				playVideoRef.current.currentTime = timings[0].start
			}
		}

		window.addEventListener('keyup', (event) => {
			if(event.key === ' ') {
				playPause()
			}
		})

	const time = timings
		playVideoRef.current.onloadedmetadata = () => {
			if(time.length === 0) {
				time.push({'start': 0, 'end': playVideoRef.current.duration})
				setTimings(time)
				addActiveSegments()
			}
			else{
				addActiveSegments()
			}
		}
	})

	useEffect(() => {
		return window.removeEventListener('mouseup', removeMouseMoveEventListener)
	}, [])

	useEffect(() => {
		return window.removeEventListener('pointerup', removePointerMoveEventListener)
	}, [])

	const handleMouseMoveWhenGrabbed = (event) => {
		playVideoRef.current.pause()
		addActiveSegments()
		let playbackRect = playBackBarRef.current.getBoundingClientRect()
		let seekRatio = (event.clientX - playbackRect.left) / playbackRect.width
		const index = currentlyGrabbedRef.current.index
		const type = currentlyGrabbedRef.current.type
		let time = timings
		let seek = playVideoRef.current.duration * seekRatio
		if((type === 'start') && (seek > ((index !== 0) ? (time[index - 1].end + difference + 0.2) : 0)) && seek < time[index].end - difference){
			progressBarRef.current.style.left = `${seekRatio * 100}%`
			playVideoRef.current.currentTime = seek
			time[index]['start'] = seek
			setPlaying(false)
			setTimings(time)
		}
		else if((type === 'end') && (seek > time[index].start + difference) && (seek < (index !== (timings.length - 1) ? time[index].start - difference - 0.2 : playVideoRef.current.duration))){
			progressBarRef.current.style.left = `${time[index].start / playVideoRef.current.duration * 100}%`
			playVideoRef.current.currentTime = time[index].start
			time[index]['end'] = seek
			setPlaying(false)
			setTimings(time)
		}
		progressBarRef.current.style.width = '0%'
	}

	const removeMouseMoveEventListener = () => {
		window.removeEventListener('mousemove', handleMouseMoveWhenGrabbed)
	}

	const removePointerMoveEventListener = () => {
		window.removeEventListener('pointermove', handleMouseMoveWhenGrabbed)
	}

	const reset = () => {
		playVideoRef.current.pause()

		setIsMuted(false)
		setPlaying(false)
		currentlyGrabbedRef.current = {'index': 0, 'type': 'none'}
		setDifference(0.2)
		setDeletingGrabber(false)
		setCurrentWarning(false)
		setImageUrl('')

		setTimings([{'start': 0, 'end': playVideoRef.current.duration}])
		playVideoRef.current.currentTime = timings[0].start
		progressBarRef.current.style.left = `${timings[0].start / playVideoRef.current.duration * 100}%`
		progressBarRef.current.style.width = '0%'
		addActiveSegments()
	}

	const captureSnapshot = () => {
		let video = playVideoRef.current
		const canvas = document.createElement('canvas')
		canvas.width = video.videoWidth
		canvas.height = video.videoHeight
		canvas.getContext('2d')
			.drawImage(video, 0, 0, canvas.width, canvas.height)
		const dataURL = canvas.toDataURL()
		setImageUrl(dataURL);
	}

	const downloadSnapshot = () => {
		let a = document.createElement('a')
		a.href = imageUrl 
		a.download = 'Thumbnail.png' 
		a.click() 
	}

	const skipPrevious = () => {
		if(playing){
			playVideoRef.current.pause()
		}

	}

	const playPause = () => {
		if(playing){
			playVideoRef.current.pause()
		}
		else{
			if((playVideoRef.current.currentTime >= timings[0].end)) {
				playVideoRef.current.pause()
				setPlaying(false)
				currentlyGrabbedRef.current = {'index': 0, 'type': 'start'}
				playVideoRef.current.currentTime = timings[0].start
				progressBarRef.current.style.left = `${timings[0].start / playVideoRef.current.duration * 100}%`
				progressBarRef.current.style.width = '0%'
			}
			playVideoRef.current.play()
		}
		setPlaying(!playing)
	}

	const skipNext = () => {
		if(playing){
			playVideoRef.current.pause()
		}
		
	}

	const updateProgress = (event) => {
		let playbackRect = playBackBarRef.current.getBoundingClientRect()
		let seekTime = ((event.clientX - playbackRect.left) / playbackRect.width) * playVideoRef.current.duration
		playVideoRef.current.pause()
		let index = -1
		let counter = 0
		for(let times of timings){
			if(seekTime >= times.start && seekTime <= times.end){
				index = counter
			}
			counter += 1
		}
		if(index === -1) {
			return
		}
		setPlaying(false)
		currentlyGrabbedRef.current = {'index': index, 'type': 'start'}
		progressBarRef.current.style.width = '0%' // Since the width is set later, this is necessary to hide weird UI
		progressBarRef.current.style.left = `${timings[index].start / playVideoRef.current.duration * 100}%`
		playVideoRef.current.currentTime = seekTime
	}

	//Function handling adding new trim markers logic
	const addGrabber = () => {
		const time = timings
		const end = time[time.length - 1].end + difference
		setDeletingGrabber({deletingGrabber: false, currentWarning: null})
		if(end >= playVideoRef.current.duration){
			return
		}
		time.push({'start': end + 0.2, 'end': playVideoRef.current.duration})
		setTimings(time)
		addActiveSegments()
	}

	const preDeleteGrabber = () => {
		if(deletingGrabber){
			setDeletingGrabber({deletingGrabber: false, currentWarning: null})
		}
		else{
			setDeletingGrabber({deletingGrabber: true, currentWarning: 'delete_grabber'})
		}
	}

	const deleteGrabber = (index) => {
		let time = timings
		setDeletingGrabber({deletingGrabber: false, currentWarning: null, currentlyGrabbed: {'index': 0, 'type': 'start'}})
		setDeletingGrabber({deletingGrabber: false, currentWarning: null, currentlyGrabbed: {'index': 0, 'type': 'start'}})
		if(time.length === 1){
			return
		}
		time.splice(index, 1)
		progressBarRef.current.style.left = `${time[0].start / playVideoRef.current.duration * 100}%`
		playVideoRef.current.currentTime = time[0].start
		progressBarRef.current.style.width = '0%'
		addActiveSegments()
	}

	const addActiveSegments = () => {
		let colors = ''
		let counter = 0
		colors += `, rgb(240, 240, 240) 0%, rgb(240, 240, 240) ${timings[0].start / playVideoRef.current.duration * 100}%`
		for(let times of timings) {
			if(counter > 0) {
				colors += `, rgb(240, 240, 240) ${timings[counter].end / playVideoRef.current.duration * 100}%, rgb(240, 240, 240) ${times.start / playVideoRef.current.duration * 100}%`
			}
			colors += `, #ccc ${times.start / playVideoRef.current.duration * 100}%, #ccc ${times.end / playVideoRef.current.duration * 100}%`
			counter += 1
		}
		colors += `, rgb(240, 240, 240) ${timings[counter - 1].end / playVideoRef.current.duration * 100}%, rgb(240, 240, 240) 100%`
		playBackBarRef.current.style.background = `linear-gradient(to right${colors})`
	}

	const saveVideo = async(fileInput) => {
		let metadata = {
			'trim_times': timings,
			'mute': isMuted
		}
		console.log(metadata.trim_times)
		const trimStart = metadata.trim_times[0].start
		const trimEnd = metadata.trim_times[0].end

		const trimmedVideo = trimEnd - trimStart

		console.log('Trimmed Duration: ', trimmedVideo)
		console.log('Trim End: ', trimEnd)

		try{
			
			ffmpeg.current.FS('writeFile', 'myFile.mp4', await fetchFile(videoUrl))

			ffmpeg.current.setProgress(({ratio}) => {
				console.log('ffmpeg progress: ', ratio)
				if(ratio < 0) {
					setProgress(0)
				}
				setProgress(Math.round(ratio * 100))
			})

			await ffmpeg.current.run('-ss', `${trimStart}`, '-accurate_seek', '-i', 'myFile.mp4', '-to', `${trimmedVideo}`, '-codec', 'copy', 'output.mp4')

			
			const data = ffmpeg.current.FS('readFile', 'output.mp4')

			const url = URL.createObjectURL(new Blob([data.buffer], {type: 'video/mp4'}))

			setTrimmedVideo(url)
			setTrimmingDone(true)
		
		}
		catch(error) {
			console.log(error)
		}
	}

	return (
		<div className='wrapper'>
			{trimmingDone ?
				<div
					style={{
						maxHeight: '100vh',
						marginTop: '50vh'
					}}>
					<video
						style={{
							width: '100%',
							marginTop: '100px',
							borderRadius: '20px',
							border: '4px solid #0072cf'
						}}
						ref={trimmedVidRef}
						controls
						autoload='metadata'
						onClick={() => console.log(trimmedVidRef.current.duration)}
					>
						<source src={trimmedVideo} type='video/mp4' />
					</video>
				</div>
				: null
			}
			<video className='video'
				autoload='metadata'
				muted={isMuted}
				ref={playVideoRef}
				onLoadedData={() => {
					console.log(playVideoRef)
					playPause()
				}}
				onClick={() => {
					playPause()
				}}
				onTimeUpdate={() => {
					setSeekerBar(progressBarRef.current.style.width)
				}}
			>
				<source src={videoUrl} type='video/mp4' />
			</video>
			<div className='playback'>
				{playVideoRef.current ?
					Array.from(timings).map((timing, index) => (
						<div key={index}
						>
							<div key={'grabber_' + index}>
								<div id='grabberStart' className='grabber start'
									style={{left: `${timings[0].start / playVideoRef.current.duration * 100}%`}}
									onMouseDown={(event) => {
										if(deletingGrabber){
											deleteGrabber(index)
										}
										else{
											currentlyGrabbedRef.current = {'index': index, 'type': 'start'}
											window.addEventListener('mousemove', handleMouseMoveWhenGrabbed)
											window.addEventListener('mouseup', removeMouseMoveEventListener)
										}
									}}
									onPointerDown={() => {
										if(deletingGrabber){
											deleteGrabber(index)
										}
										else{
											currentlyGrabbedRef.current = {'index': index, 'type': 'start'}
											window.addEventListener('pointermove', handleMouseMoveWhenGrabbed)
											window.addEventListener('pointerup', removePointerMoveEventListener)
										}
									}}
								>
									<svg version='1.1' xmlns='http://www.w3.org/2000/svg' x='0' y='0' width='10' height='14' viewBox='0 0 10 14' xmlSpace='preserve'>
										<path className='st0' d='M1 14L1 14c-0.6 0-1-0.4-1-1V1c0-0.6 0.4-1 1-1h0c0.6 0 1 0.4 1 1v12C2 13.6 1.6 14 1 14zM5 14L5 14c-0.6 0-1-0.4-1-1V1c0-0.6 0.4-1 1-1h0c0.6 0 1 0.4 1 1v12C6 13.6 5.6 14 5 14zM9 14L9 14c-0.6 0-1-0.4-1-1V1c0-0.6 0.4-1 1-1h0c0.6 0 1 0.4 1 1v12C10 13.6 9.6 14 9 14z'/>
									</svg>
								</div>
								<div id='grabberEnd' className='grabber end'
									style={{left: `${timings[0].end / playVideoRef.current.duration * 100}%`}}
									onMouseDown={(event) => {
										if(deletingGrabber){
											deleteGrabber(index)
										}
										else{
											currentlyGrabbedRef.current = {'index': index, 'type': 'end'}
											window.addEventListener('mousemove', handleMouseMoveWhenGrabbed)
											window.addEventListener('mouseup', removeMouseMoveEventListener)
										}
									}}
									onPointerDown={() => {
										if(deletingGrabber){
											deleteGrabber(index)
										}
										else{
											currentlyGrabbedRef.current = {'index': index, 'type': 'end'}
											window.addEventListener('pointermove', handleMouseMoveWhenGrabbed)
											window.addEventListener('pointerup', removePointerMoveEventListener)
										}
									}}
								>
									<svg version='1.1' xmlns='http://www.w3.org/2000/svg' x='0' y='0' width='10' height='14' viewBox='0 0 10 14' xmlSpace='preserve'>
										<path className='st0' d='M1 14L1 14c-0.6 0-1-0.4-1-1V1c0-0.6 0.4-1 1-1h0c0.6 0 1 0.4 1 1v12C2 13.6 1.6 14 1 14zM5 14L5 14c-0.6 0-1-0.4-1-1V1c0-0.6 0.4-1 1-1h0c0.6 0 1 0.4 1 1v12C6 13.6 5.6 14 5 14zM9 14L9 14c-0.6 0-1-0.4-1-1V1c0-0.6 0.4-1 1-1h0c0.6 0 1 0.4 1 1v12C10 13.6 9.6 14 9 14z'/>
									</svg>
								</div>
							</div>
						</div>
					))
					: []}
				<div className='seekable' ref={playBackBarRef} onClick={updateProgress}></div>
				<div className='progress' ref={progressBarRef}></div>
			</div>

			<div className='controls'>
				<div className='player-controls'>
					<button className='settings-control' title='Reset Video' onClick={reset}><FontAwesomeIcon icon={faSync} /></button>
					<button className='settings-control' title='Mute/Unmute Video' onClick={() => setIsMuted({isMuted: !isMuted})}>{isMuted ? <FontAwesomeIcon icon={faVolumeMute} /> : <FontAwesomeIcon icon={faVolumeUp} />}</button>
					<button className='settings-control' title='Capture Thumbnail' onClick={captureSnapshot}><FontAwesomeIcon icon={faCamera} /></button>
				</div>
				<div className='player-controls'>
					<button className='seek-start' title='Skip to previous clip' onClick={skipPrevious}><FontAwesomeIcon icon={faStepBackward} /></button>
					<button className='play-control' title='Play/Pause' onClick={playPause} >{playing ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} /> }</button>
					<button className='seek-end' title='Skip to next clip' onClick={skipNext}><FontAwesomeIcon icon={faStepForward} /></button>
				</div>
				<div>
					<button title='Add grabber' className='trim-control margined' onClick={addGrabber}>Add <FontAwesomeIcon icon={faGripLinesVertical} /></button>
					<button title='Delete grabber' className='trim-control margined' onClick={preDeleteGrabber}>Delete <FontAwesomeIcon icon={faGripLinesVertical} /></button>
					<button title='Save changes' className='trim-control' onClick={saveVideo}>Save</button>
				</div>
			</div>
			{ready ?
				<div></div>
				:
				<div>Loading...</div>
			}
			{currentWarning != null ? <div className={'warning'}>{warnings[currentWarning]}</div> : ''}
			{(imageUrl !== '') ?
				<div className={'marginVertical'}>
					<img src={imageUrl} className={'thumbnail'} alt='Photos' />
					<div className='controls'>
						<div className='player-controls'>
							<button className='settings-control' title='Reset Video' onClick={downloadSnapshot}><FontAwesomeIcon icon={faDownload} /></button>
							<button className='settings-control' title='Save Video' onClick={() => {
								setImageUrl('')
							}}><FontAwesomeIcon icon={faEraser} /></button>
						</div>
					</div>
				</div>
				: ''}
		</div>
	)
}

export default Editor
import {useState, useEffect} from 'react'
import {FileDrop} from 'react-file-drop' 
import '../editor.css'
import Editor from './Editor'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome' 
import {faLightbulb, faMoon} from '@fortawesome/free-solid-svg-icons'

function VideoEditor() {

	const [isUpload, setIsUpload] = useState(true)

	const [videoUrl, setVideoUrl] = useState('')
	const [videoBlob, setVideoBlob] = useState('')

	const [isDarkMode, setIsDarkMode] = useState(false)

	const [timings, setTimings] = useState([])


	useEffect(() => {
		toggleThemes()
		document.addEventListener('drop', function(e) {
			e.preventDefault()
			e.stopPropagation()
		})
	}, [toggleThemes])

	const renderUploader = () => {
		return (
			<div className={'wrapper'}>
				<input
					onChange={(e) => uploadFile(e.target.files)}
					type='file'
					className='hidden'
					id='up_file'
				/>
				<FileDrop
					onDrop={(e) => uploadFile(e)}
					onTargetClick={() => document.getElementById('up_file').click()}
				>
                    Click or drop your video here to edit!
					<div>
					<span>
	<h5 style={{color:"red"}}>Note: Click Add and Save Your Edited Video</h5>
					</span>
					</div>
				</FileDrop>
				
			</div>
		)
	}

	const renderEditor = () => {
		return (
			<Editor
				videoUrl={videoUrl}
				videoBlob={videoBlob}
				setVideoUrl={setVideoUrl}
				timings={timings}
				setTimings={setTimings}
			/>
		)
	}

	const toggleThemes = () => {
		if(isDarkMode) {
			document.body.style.backgroundColor = '#1f242a'
			document.body.style.color = '#fff'
		}
		if(!isDarkMode){
			document.body.style.backgroundColor = '#fff'
			document.body.style.color = '#1f242a'
		}
		setIsDarkMode(!isDarkMode)
	}

	const uploadFile = async (fileInput) => {
		console.log(fileInput[0])
		let fileUrl = URL.createObjectURL(fileInput[0])
		setIsUpload(false)
		setVideoUrl(fileUrl)
		setVideoBlob(fileInput[0])
	}

	return (
		<div>
			{isUpload ? renderUploader() : renderEditor()}
			<div className={'theme_toggler'} onClick={toggleThemes}>
				{isDarkMode ?
					(<i className='toggle' aria-hidden='true'>
						<FontAwesomeIcon icon={faLightbulb} /></i>)
					:
					<i className='toggle'><FontAwesomeIcon icon={faMoon} /></i>}
			</div>
		</div>
	)
}

export default VideoEditor

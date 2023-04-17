var video = document.querySelector('#recording');
var output = document.querySelector('#output');
var start = document.querySelector('#start-btn');
var stop = document.querySelector('#stop-btn');
var anc = document.querySelector("#download-anc")
var audio_btn = document.querySelector("#audio_check")
var data = [];
var hidden = true;
// let desktop_audio = false;
const options = { mimeType: "video/webm; codecs=vp9" };
// In order record the screen with system audio

start.addEventListener('click', (e) => {
	
	data = []
	if (!hidden) {
		anc.classList.toggle('hidden')
		hidden = false
	}
	recordScreen()
});


const recordScreen = async () => {

	const e = await navigator.mediaDevices.getDisplayMedia({
		video: {
			mediaSource: 'screen',
		},
		audio: true,
	})

	let audio = await navigator.mediaDevices.getUserMedia({
		audio: true, video: false
	})
	audio.getTracks()[0].enabled = audio_btn.checked

	audio_btn.onclick = ev => {

		audio.getTracks()[0].enabled = audio_btn.checked
	}

	let FinalAudioStream = audio;
	if (e.getAudioTracks().length != 0) {
		const audioContext = new AudioContext();
		const DesktopAudio = new MediaStream();
		DesktopAudio.addTrack(e.getAudioTracks()[0])

		const MicAudio = new MediaStream();
		MicAudio.addTrack(audio.getAudioTracks()[0])

		const audioIn_01 = audioContext.createMediaStreamSource(DesktopAudio);
		const audioIn_02 = audioContext.createMediaStreamSource(MicAudio);

		const dest = audioContext.createMediaStreamDestination();

		audioIn_01.connect(dest);
		audioIn_02.connect(dest);
		FinalAudioStream = dest.stream;
	}

	// Assign the recorded mediastream to the src object
	video.srcObject = e;

	// Combine both video/audio stream with MediaStream object
	let combine = new MediaStream(
		[...e.getVideoTracks(), ...FinalAudioStream.getTracks()])

	/* Record the captured mediastream
	with MediaRecorder constructor */
	let recorder = new MediaRecorder(combine);

	recorder.start()
	alert("recording started")

	stop.addEventListener('click', (event) => {
		// Stops the recording
		console.log(recorder)
		recorder.stop();
		console.log(recorder)
		alert("recording stopped")
		video.srcObject = null
		e.getTracks().forEach(track => track.stop())
		audio.getTracks().forEach(track => track.stop())
	});

	e.getVideoTracks().forEach(track => {
		track.addEventListener("ended", ev => {
			if (recorder.state !== 'inactive')
				recorder.stop();
			alert("recording stopped")
			video.srcObject = null
			audio.getTracks().forEach(track => track.stop())
		})
	})
	/* Push the recorded data to data array
	when data available */
	recorder.ondataavailable = (e) => {
		data.push(e.data);
	};

	recorder.onstop = () => {

		/* Convert the recorded audio */
		let blobData = new Blob(data, options);

		// Convert the blob data to a url
		let url = URL.createObjectURL(blobData)

		// Assign the url to the output video tag and anchor
		output.src = url
		anc.href = url
		anc.classList.remove('hidden')
	};
	// });

}

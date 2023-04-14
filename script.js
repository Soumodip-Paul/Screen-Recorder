var video = document.querySelector('.recording');
var output = document.querySelector('.output');
var start = document.querySelector('.start-btn');
var stop = document.querySelector('.stop-btn');
var anc = document.querySelector(".download-anc")
var data = [];
const options = { mimeType: "video/webm; codecs=vp9" };
// In order record the screen with system audio

start.addEventListener('click', (e) => {

	data = []
	recordScreen()
});


const recordScreen = async () => {

	const e = await navigator.mediaDevices.getDisplayMedia({
		video: {
			mediaSource: 'screen',
		},
		audio: true,
	})
	// .then(async (e) => {

	// For recording the mic audio
	const get_audio = confirm("Do you want to record mic audio")
	
	let audio = await navigator.mediaDevices.getUserMedia({
		audio: get_audio, video: false
	})

	// Assign the recorded mediastream to the src object
	video.srcObject = e;

	// Combine both video/audio stream with MediaStream object
	let combine = new MediaStream(
		[...e.getTracks(), ...audio.getTracks()])

	/* Record the captured mediastream
	with MediaRecorder constructor */
	let recorder = new MediaRecorder(combine);

	recorder.start()
	alert("recording started")

	stop.addEventListener('click', (event) => {
		// Stops the recording
		recorder.stop();
		alert("recording stopped")
		video.srcObject = null
		e.getTracks().forEach(track => track.stop())
		audio.getTracks().forEach(track => track.stop())
	});

	e.getVideoTracks().forEach(track => {
		track.addEventListener("ended", ev => {
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
		let blobData = new Blob(data,options);

		// Convert the blob data to a url
		let url = URL.createObjectURL(blobData)

		// Assign the url to the output video tag and anchor
		output.src = url
		anc.href = url
	};
	// });

}

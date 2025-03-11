<?php
	session_start(['cookie_lifetime' => 60,'gc_maxlifetime' => 60]);

	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: POST, OPTIONS");
	header("Access-Control-Allow-Headers: Content-Type, Authorization");
	header("Content-Type: audio/mpeg");

	// Handle preflight requests (CORS preflight request using OPTIONS method)
	if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
		http_response_code(204);
		exit;
	}

	// error_reporting(E_ALL);
	// ini_set('display_errors', 1);

	// Keys
	$validationKey = "VLID_API_KEY"; // Validation Key Sent in from Client
	$openAIKey = "YOUR_API_KEY"; // Open AI Project Key

	// Validate API Key
	$headers = getallheaders();
	if (!isset($headers['Authorization']) || trim(str_replace('Bearer ', '', $headers['Authorization'])) !== $validationKey) {
		http_response_code(403);
		echo json_encode(["error" => "Unauthorized access"]);
		exit;
	}

	// Track API usage
	if (!isset($_SESSION['tts_requests'])) {
	    $_SESSION['tts_requests'] = [];
	}

	// Remove old requests
	$time = time();
	$_SESSION['tts_requests'] = array_filter($_SESSION['tts_requests'], function($timestamp) use ($time) {
	    return ($time - $timestamp) < 60;
	});

	// Check limit
	$limitPerMinute = 1;
	if (count($_SESSION['tts_requests']) >= $limitPerMinute) {
	    http_response_code(429);
	    echo json_encode(["error" => "Rate limit exceeded. Try again later."]);
	    exit;
	}

	// Log the request
	$_SESSION['tts_requests'][] = $time;

	// Read raw POST data
	$rawData = file_get_contents("php://input");
	$inputData = json_decode($rawData, true);

	// Debugging: Log received data
	// file_put_contents("debug.log", "Raw Input: " . $rawData . "\n", FILE_APPEND);

	if (!$inputData || !isset($inputData['text']) || empty(trim($inputData['text']))) {
		echo json_encode(["error" => "No text provided"]);
		exit;
	}

	// Get the input data
	$text = trim($inputData['text'] ?? '');
	$voice = $inputData['voice'] ?? 'alloy';
	$pitch = $inputData['pitch'] ?? 1.0;
	$rate = $inputData['rate'] ?? 1.0;

	if (!$text) {
		http_response_code(400);
		echo json_encode(["error" => "No text provided"]);
		exit;
	}

	$maxLength = 1000;
	if (strlen($text) > $maxLength) {
		http_response_code(400);
		echo json_encode(["error" => "Text length exceeds $maxLength characters"]);
		exit;
	}


	// Prepare the API request
	$context = stream_context_create([
		"http" => [
			"header" => "Authorization: Bearer $openAIKey\r\n" .
						"Content-Type: application/json\r\n",
			"method" => "POST",
			"content" => json_encode([
				"model" => "tts-1",
				"input" => $text,
				"voice" => $voice,
				"pitch" => $pitch,
				"rate" => $rate
			]),
			"ignore_errors" => true
		]
	]);
	$response = file_get_contents("https://api.openai.com/v1/audio/speech", false, $context);

	if ($response === FALSE) {
		http_response_code(500);
		echo json_encode(["error" => "Failed to fetch TTS audio"]);
		exit;
	}


	header("Content-Type: audio/mpeg");
	header("Content-Disposition: inline; filename=\"tts_audio.mp3\"");
	echo $response;

	exit;
?>

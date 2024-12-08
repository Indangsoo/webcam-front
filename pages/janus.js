import 'webrtc-adapter';
import { useEffect, useRef } from 'react';
import Janus from 'janus-gateway';
import adapter from 'webrtc-adapter';

export default function Home() {
  const videoRef = useRef(null);
  const pluginHandleRef = useRef(null);
  const remoteStreamRef = useRef(null); // Initialize as null

  useEffect(() => {
    // Check if MediaStream is available (i.e., we're in the browser)
    if (typeof window !== 'undefined' && typeof MediaStream !== 'undefined') {
      remoteStreamRef.current = new MediaStream(); // Initialize MediaStream here
    } else {
      console.error('MediaStream is not supported in this environment.');
      return;
    }

    Janus.init({
      debug: 'all',
      dependencies: Janus.useDefaultDependencies({ adapter: adapter }),
      callback: () => {
        const janus = new Janus({
          //server: 'http://59.187.251.226:58088/janus', // Janus server address
          server: 'http://59.187.251.226:34549/janus',

          success: () => {
            janus.attach({
              plugin: 'janus.plugin.streaming',
              success: (pluginHandle) => {
                pluginHandleRef.current = pluginHandle;
                const body = { request: 'watch', id: 1 }; // Stream ID
                pluginHandle.send({ message: body });
              },
              onmessage: (msg, jsep) => {
                console.log('onmessage');
                const pluginHandle = pluginHandleRef.current;
                if (jsep !== undefined && jsep !== null) {
                  pluginHandle.createAnswer({
                    jsep: jsep,
                    tracks: [{ type: 'video', recv: true }],
                    success: (jsep) => {
                      const body = { request: 'start' };
                      pluginHandle.send({ message: body, jsep: jsep });
                    },
                    error: (error) => {
                      console.error('WebRTC error:', error);
                    },
                  });
                }
              },
              onremotetrack: (track, mid, added) => {
                console.log('onremotetrack:', track, mid, added);
                if (added) {
                  // Add the track to the remote stream
                  if (remoteStreamRef.current) {
                    remoteStreamRef.current.addTrack(track.clone());
                    if (videoRef.current) {
                      videoRef.current.srcObject = remoteStreamRef.current;
                    }
                  }
                } else {
                  // Remove the track from the remote stream
                  if (remoteStreamRef.current) {
                    remoteStreamRef.current.getTracks().forEach((t) => {
                      if (t.id === track.id) {
                        remoteStreamRef.current.removeTrack(t);
                      }
                    });
                  }
                }
              },
              oncleanup: () => {
                console.log('Cleanup done');
                // Reset the remote stream
                if (remoteStreamRef.current) {
                  remoteStreamRef.current.getTracks().forEach((track) => {
                    track.stop();
                  });
                  remoteStreamRef.current = new MediaStream();
                }
                if (videoRef.current) {
                  videoRef.current.srcObject = null;
                }
              },
            });
          },
          error: (error) => {
            console.error('Janus error:', error);
          },
          destroyed: () => {
            console.log('Janus instance destroyed');
          },
        });
      },
    });
  }, []);

  return (
    <div>
      <h1>WebRTC Stream Test Page</h1>
      <video ref={videoRef} autoPlay playsInline controls />
    </div>
  );
}
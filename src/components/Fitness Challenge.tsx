
export const FitnessChallenge = () => {


}

return (
    <>
<div className="section-header">
            <input
              type="checkbox"
              className="themed-checkbox"
              checked={checkboxes.videoDone}
              onChange={() => handleToggle('videoDone')}
              />
            <h3>🏅 Fitness Challenge</h3>
          </div>

          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src={dayData.videoUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                ></iframe>
          </div> 
                </>
          )

          export default FitnessChallenge
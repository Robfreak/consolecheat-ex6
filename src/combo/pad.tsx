import { DIRECTION_GLYPH } from "./notation.ts";
import { buttonLabel, directionLabel, type Copy } from "./messages.ts";
import { FaceMark } from "./symbols.tsx";
import { FACE_BUTTONS, type Direction, type FaceButton } from "./types.ts";

const PAD: (Direction | null)[] = [7, 8, 9, 4, null, 6, 1, 2, 3];

export function TouchControls({
  text,
  onDirectionDown,
  onDirectionUp,
  onButton,
}: {
  text: Copy;
  onDirectionDown: (direction: Direction) => void;
  onDirectionUp: (direction: Direction) => void;
  onButton: (button: FaceButton) => void;
}) {
  return (
    <div className="touch-row">
      <div>
        <p className="text-sm font-semibold">{text.padHeading}</p>
        <div className="dpad dpad-play mt-2" role="group" aria-label={text.padHeading}>
          {PAD.map((direction, index) =>
            direction == null ? (
              <span key={`gap-${index}`} className="pad-gap" aria-hidden="true" />
            ) : (
              <button
                key={direction}
                type="button"
                className="pad-btn"
                data-testid={`dir-${direction}`}
                aria-label={directionLabel(text, direction)}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  onDirectionDown(direction);
                }}
                onPointerUp={() => onDirectionUp(direction)}
                onPointerCancel={() => onDirectionUp(direction)}
                onClick={(event) => {
                  if (event.detail !== 0) return;
                  onDirectionDown(direction);
                  onDirectionUp(direction);
                }}
              >
                <span aria-hidden="true">{DIRECTION_GLYPH[direction]}</span>
              </button>
            ),
          )}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold">{text.faceHeading}</p>
        <div className="faces mt-2" role="group" aria-label={text.faceHeading}>
          {FACE_BUTTONS.map((button) => (
            <button
              key={button}
              type="button"
              className={`face-hit face-${button}`}
              data-testid={`btn-${button}`}
              aria-label={buttonLabel(text, button)}
              onPointerDown={(event) => {
                if (event.pointerType === "mouse" && event.button !== 0) return;
                event.preventDefault();
                onButton(button);
              }}
              onClick={(event) => {
                if (event.detail !== 0) return;
                onButton(button);
              }}
            >
              <FaceMark button={button} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

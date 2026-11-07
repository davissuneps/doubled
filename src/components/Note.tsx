import { useRef, useState } from 'react'
import { mailDraftHref, noteBody, NOTE_LIMIT } from '../lib/note'

export function Note() {
  const [text, setText] = useState('')
  const [status, setStatus] = useState('')
  const areaRef = useRef<HTMLTextAreaElement>(null)

  async function copyNote() {
    const value = noteBody(text)
    try {
      await navigator.clipboard.writeText(value)
      setStatus('Copied to the clipboard. Nothing was sent.')
    } catch {
      setStatus('Clipboard blocked. The note is selected — copy it from the browser instead.')
      areaRef.current?.focus()
      areaRef.current?.select()
    }
  }

  return (
    <section className="section ruled" id="note" aria-labelledby="note-title">
      <div className="wrap">
        <p className="kicker">04 — Note</p>
        <h2 id="note-title">Leave a note on this device.</h2>
        <p className="lead" id="note-help">
          Nothing here is submitted. Copy the note, or open a mail draft with the To field left
          empty and send it yourself if you want to.
        </p>
        <label className="note-label" htmlFor="note-body">
          Your note
        </label>
        <textarea
          id="note-body"
          ref={areaRef}
          maxLength={NOTE_LIMIT}
          value={text}
          aria-describedby="note-help"
          placeholder="A line about the tune, the gap, or the pair."
          onChange={(event) => setText(event.target.value)}
        />
        <p className="count">
          {text.length} / {NOTE_LIMIT}
        </p>
        <div className="note-actions">
          <button type="button" className="btn btn-primary" onClick={copyNote}>
            Copy note
          </button>
          <a className="link" href={mailDraftHref(text)}>
            Open a mail draft
            <span className="sr-only">
              {' '}
              in your mail app. The To field is left empty. This page does not send it.
            </span>
          </a>
        </div>
        <p className="status" role="status">
          {status}
        </p>
      </div>
    </section>
  )
}

export interface CustomEvents {
  table_scroll_to_index: { index: number };
}

const EventBus = {
  on<Event extends keyof CustomEvents>(
    event: Event,
    callback: (e: CustomEvent<CustomEvents[Event]>) => void
  ) {
    document.addEventListener(event, callback as EventListener);
  },
  dispatch<Event extends keyof CustomEvents>(
    event: Event,
    data: CustomEvents[Event]
  ) {
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
  remove<Event extends keyof CustomEvents>(
    event: Event,
    callback: (e: CustomEvent<CustomEvents[Event]>) => void
  ) {
    document.removeEventListener(event, callback as EventListener);
  }
};

export default EventBus;

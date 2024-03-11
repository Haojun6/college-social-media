import datetime
import os.path

from flask import Flask, send_from_directory, request, jsonify
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS #comment this on deployment
from api.HelloApiHandler import HelloApiHandler
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

app = Flask(__name__, static_url_path='', static_folder='frontend/build')
CORS(app) #comment this on deployment
api = Api(app)

@app.route("/", defaults={'path':''})
def serve(path):
    return send_from_directory(app.static_folder,'index.html')

api.add_resource(HelloApiHandler, '/flask/hello')

# If modifying these scopes, delete the file token.json.

#@app.route('/calendar', methods=['POST'])
#def create_event():
#    SCOPES = ["https://www.googleapis.com/auth/calendar"]
#    creds = None
#    # The file token.json stores the user's access and refresh tokens, and is
#    # created automatically when the authorization flow completes for the first
#    # time.
#    if os.path.exists("token.json"):
#        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
#    # If there are no (valid) credentials available, let the user log in.
#    if not creds or not creds.valid:
#        if creds and creds.expired and creds.refresh_token:
#            creds.refresh(Request())
#    else:
#        flow = InstalledAppFlow.from_client_secrets_file(
#            "credentials.json", SCOPES
#        )
#        creds = flow.run_local_server(port=8080)
#        # Save the credentials for the next run
#        with open("token.json", "w") as token:
#            token.write(creds.to_json())
#
#    try:
#        service = build("calendar", "v3", credentials=creds)
#
#        event = request.json
#
#        print(event)
#
#        event = service.events().insert(calendarId='primary', body=event).execute()
#        print('Event created: %s' % (event.get('htmlLink')))
#        return jsonify({'message': 'Event created successfully'}), 200
#    
#    except HttpError as error:
#        print(f"An error occurred: {error}")
#        return jsonify({'error': str(error)}), 500  # Return error response
SCOPES = ["https://www.googleapis.com/auth/calendar"]

def main():
  """Shows basic usage of the Google Calendar API.
  Prints the start and name of the next 10 events on the user's calendar.
  """
  creds = None
  # The file token.json stores the user's access and refresh tokens, and is
  # created automatically when the authorization flow completes for the first
  # time.
  if os.path.exists("token.json"):
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
  # If there are no (valid) credentials available, let the user log in.
  if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
      creds.refresh(Request())
    else:
      flow = InstalledAppFlow.from_client_secrets_file(
          "credentials.json", SCOPES
      )
      creds = flow.run_local_server(port=8080)
    # Save the credentials for the next run
    with open("token.json", "w") as token:
      token.write(creds.to_json())

    try:
        service = build("calendar", "v3", credentials=creds)

        event = {
            'summary': 'Sample Event',
            'location': 'Trinity College Dublin, College Green, Dublin 2',
            'description': 'DUCSS society event',
            'start': {
                'dateTime': '2024-03-12T09:00:00',
                'timeZone': 'Europe/Dublin',
            },
            'end': {
                'dateTime': '2024-03-12T11:00:00',
                'timeZone': 'Europe/Dublin',
            },
            'recurrence': [
            ],
            'attendees': [
                {'email': 'fitzpady@tcd.ie'},
                {'email': 'sbrin@example.com'},
            ],
            'reminders': {
                'useDefault': False,
                'overrides': [
                {'method': 'email', 'minutes': 24 * 60},
                {'method': 'popup', 'minutes': 10},
                ],
            },
        }

        event = service.events().insert(calendarId='primary', body=event).execute()
        print('Event created: %s' % (event.get('htmlLink')))

    except HttpError as error:
        print(f"An error occurred: {error}")
    
    os.remove('token.json')

if __name__ == '__main__':
    main()
    #app.run(port=8000)
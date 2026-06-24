#!/usr/bin/env ruby
# Adds PrivacyInfo.xcprivacy to the Capacitor "App" target so it ships in the
# bundle. The xcodeproj gem ships with CocoaPods (already installed in CI).
# Idempotent: safe to run on every build.
require 'xcodeproj'

project_path = 'ios/App/App.xcodeproj'
project = Xcodeproj::Project.open(project_path)

target = project.targets.find { |t| t.name == 'App' }
raise 'App target not found' unless target

app_group = project.main_group.find_subpath('App', false)
raise 'App group not found' unless app_group

already = app_group.files.any? { |f| f.display_name == 'PrivacyInfo.xcprivacy' }
unless already
  ref = app_group.new_reference('PrivacyInfo.xcprivacy')
  target.add_resources([ref])
  puts 'PrivacyInfo.xcprivacy linked to App target'
else
  puts 'PrivacyInfo.xcprivacy already linked'
end

project.save

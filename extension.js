/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
import GObject from 'gi://GObject';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import {QuickToggle, SystemIndicator} from 'resource:///org/gnome/shell/ui/quickSettings.js';

const SubtitleToggle = GObject.registerClass(
class SubtitleToggle extends QuickToggle {
    constructor() {
        super({
            title: _('Subtitles'),
            iconName: 'media-view-subtitles-symbolic',
            toggleMode: true,
        });
    }
});

const SubtitleIndicator = GObject.registerClass(
class SubtitleIndicator extends SystemIndicator {
    constructor() {
        super();

        this._indicator = this._addIndicator();
        this._indicator.iconName = 'media-view-subtitles-symbolic';
    }
});

export default class SubtitlesExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this.subtitleIndicator = null;
        this.subtitleToggle = null;
        this.subtitleContainer = null;
        this.subtitleLabel = null;
        this.settings = this.getSettings('org.gnome.shell.extensions.subtitles');
        this._settingsChangedSignal = null;
    }
    enable() {
        //Creating Indicator
        this.subtitleIndicator = new SubtitleIndicator(this);

        // Creating Toggle
        this.subtitleToggle = new SubtitleToggle()
        this.settings.bind('show-subtitles', this.subtitleToggle, 'checked', GObject.BindingFlags.DEFAULT)
        this.settings.bind('show-subtitles', this.subtitleIndicator, 'visible', GObject.BindingFlags.DEFAULT)
        // Adding toggle to quicksettings
        this.subtitleIndicator.quickSettingsItems.push(this.subtitleToggle)
        Main.panel.statusArea.quickSettings.addExternalIndicator(this.subtitleIndicator);
        
        this.subtitleLabel = new St.Label({
            style_class: 'subtitle-text',
            text: "Hello, GNOME!",
            reactive: false
        })
        // Creating Subtitle Block
        this.subtitleContainer = new St.Bin({
            style_class: 'subtitle-container'
        });
        this.subtitleContainer.set_child(this.subtitleLabel);

        global.stage.add_child(this.subtitleContainer);
        this.updateSubtitleContainerPosition(this.subtitleContainer);
        this.settings.bind('show-subtitles', this.subtitleContainer, 'visible', GObject.BindingFlags.DEFAULT)

        // Taking care of screen changes
        this._monitorsChangedSignal = Main.layoutManager.connect('monitors-changed', this.updateSubtitleContainerPosition.bind(this));

        this._settingsChangedSignal = this.settings.connect('changed::show-subtitles', this._changeTextAfterTimeout.bind(this))
    }

    _changeTextAfterTimeout(){
        setTimeout(() => {
            this.updateSubtitleText("Lorem ipsum");
            setTimeout(() => {
                this.updateSubtitleText("I am changing my text");
                setTimeout(() => {
                    this.updateSubtitleText("Just pretend like whisper recorded this, okay?");
                    setTimeout(() => {
                        this.updateSubtitleText("Yeah I also just noticed that is the hardest part, shut up");
                    }, 2000)
                }, 2000)
            }, 2000)
        }, 2000)
        
        
        
    }

    updateSubtitleContainerPosition() {
        if (!this.subtitleContainer) return;
        let monitor = Main.layoutManager.primaryMonitor;
        this.subtitleContainer.set_position(
            Math.floor(monitor.width / 2 - this.subtitleContainer.width / 2 + Main.layoutManager.primaryMonitor.x),
            Math.floor(monitor.height - this.subtitleContainer.height - 50 + Main.layoutManager.primaryMonitor.y)
        );
    }

    updateSubtitleText(newText){
        if(this.subtitleLabel) {
            this.subtitleLabel.set_text(newText);
        }
        this.updateSubtitleContainerPosition();
    }

    disable() {
        if (this._monitorsChangedSignal) {
            Main.layoutManager.disconnect(this._monitorsChangedSignal);
            this._monitorsChangedSignal = null;
        }
        if (this._actorAddedSignal) {
            Main.uiGroup.disconnect(this._actorAddedSignal);
            this._actorAddedSignal = null;
        }
        
        if (this.subtitleContainer) {
            this.subtitleContainer.destroy();
            this.subtitleContainer = null;
        }

        if (this.subtitleIndicator) {
            this.subtitleIndicator.quickSettingsItems.forEach(item => item.destroy());
            this.subtitleIndicator.destroy();
            this.subtitleIndicator = null;
        }
        
        if (this.subtitleToggle) {
            this.subtitleToggle.destroy();
            this.subtitleToggle = null;
        }
        
        if (this.subtitleLabel){
            this.subtitleLabel.destroy();
            this.subtitleLabel = null;
        }
    }
}

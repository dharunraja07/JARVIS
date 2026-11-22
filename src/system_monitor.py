import platform
import shutil
from datetime import datetime

import psutil


def get_cpu_info():
    return {
        "processor": platform.processor() or "Unknown",
        "usage": psutil.cpu_percent(interval=1),
        "cores": psutil.cpu_count(logical=False) or 0,
        "logical_processors": psutil.cpu_count(logical=True) or 0,
    }


def get_memory_info():
    memory = psutil.virtual_memory()

    return {
        "total_gb": round(memory.total / (1024**3), 2),
        "used_gb": round(memory.used / (1024**3), 2),
        "available_gb": round(memory.available / (1024**3), 2),
        "usage_percent": memory.percent,
    }


def get_disk_info():
    disk = shutil.disk_usage("C:\\")

    return {
        "total_gb": round(disk.total / (1024**3), 2),
        "used_gb": round(disk.used / (1024**3), 2),
        "free_gb": round(disk.free / (1024**3), 2),
        "usage_percent": round((disk.used / disk.total) * 100, 2),
    }


def get_battery_info():
    battery = psutil.sensors_battery()

    if battery is None:
        return {"available": False, "message": "Battery information unavailable."}

    return {
        "available": True,
        "percentage": battery.percent,
        "plugged_in": battery.power_plugged,
        "status": "Charging" if battery.power_plugged else "Not charging",
        "time_left_seconds": battery.secsleft,
    }


def get_system_report():
    cpu = get_cpu_info()
    memory = get_memory_info()
    disk = get_disk_info()
    battery = get_battery_info()

    report = [
        "JARVIS SYSTEM MONITOR REPORT",
        f"Generated: {datetime.now().strftime('%d-%m-%Y %I:%M:%S %p')}",
        "",
        "PROCESSOR",
        f"Processor: {cpu['processor']}",
        f"CPU Usage: {cpu['usage']}%",
        f"Physical Cores: {cpu['cores']}",
        f"Logical Processors: {cpu['logical_processors']}",
        "",
        "MEMORY",
        f"Total RAM: {memory['total_gb']} GB",
        f"Used RAM: {memory['used_gb']} GB",
        f"Available RAM: {memory['available_gb']} GB",
        f"RAM Usage: {memory['usage_percent']}%",
        "",
        "DISK (C:)",
        f"Total: {disk['total_gb']} GB",
        f"Used: {disk['used_gb']} GB",
        f"Free: {disk['free_gb']} GB",
        f"Disk Usage: {disk['usage_percent']}%",
        "",
        "BATTERY",
    ]

    if battery["available"]:
        report.extend(
            [
                f"Battery: {battery['percentage']}%",
                f"Power: {battery['status']}",
            ]
        )
    else:
        report.append(battery["message"])

    report.extend(
        [
            "",
            f"Operating System: {platform.system()} {platform.release()}",
            f"Architecture: {platform.machine()}",
        ]
    )

    return "\n".join(report)
